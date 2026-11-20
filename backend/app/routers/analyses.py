from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, func, or_
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.activity_log import ActivityLog
from app.models.analysis import Analysis
from app.models.comment import Comment
from app.models.prediction import Prediction
from app.models.topic import Topic
from app.models.user import User
from app.schemas.analysis import (
    AnalysisDetailResponse,
    AnalysisListResponse,
    AnalysisResultsResponse,
    AnalysisRunResponse,
    AnalysisSummary,
    CommentItemResponse,
    LabelDistribution,
    PaginatedCommentsResponse,
    SentimentKeywords,
    TopicItem,
)
from app.services.analysis_service import build_analysis_detail
from app.services.auth_service import get_current_user
from app.services.keyword_service import top_keywords
from app.services.preprocessing import clean_text
from app.services.sentiment_service import (
    ModelNotAvailableError,
    SentimentClassifier,
    get_sentiment_classifier,
)

router = APIRouter(prefix="/api/analyses", tags=["Analyses"])


@router.get("", response_model=AnalysisListResponse)
def list_user_analyses(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Analysis).filter(Analysis.user_id == current_user.id)
    total = query.count()

    analyses = (
        query.order_by(desc(Analysis.created_at))
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    items = [AnalysisSummary.model_validate(a) for a in analyses]
    return AnalysisListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{analysis_id}", response_model=AnalysisDetailResponse)
def get_analysis_detail(
    analysis_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analisis tidak ditemukan atau Anda tidak memiliki akses.",
        )

    return build_analysis_detail(db, analysis)


@router.get("/{analysis_id}/comments", response_model=PaginatedCommentsResponse)
def get_analysis_comments(
    analysis_id: UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    q: str | None = Query(None, description="Pencarian teks komentar atau username"),
    label: str | None = Query(
        None, description="Filter sentimen: positif, netral, negatif"
    ),
    sort: str = Query("date", pattern="^(date|likes)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validasi kepemilikan
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analisis tidak ditemukan atau Anda tidak memiliki akses.",
        )

    query = db.query(Comment).filter(Comment.analysis_id == analysis_id)

    # 1. Filter teks (q)
    if q and q.strip():
        search_term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Comment.text_raw).like(search_term),
                func.lower(Comment.username).like(search_term),
            )
        )

    # 2. Filter label sentimen
    if label and label.strip() in ["positif", "netral", "negatif"]:
        query = query.filter(Comment.label == label.strip().lower())

    total = query.count()

    # 3. Sorting
    if sort == "likes":
        sort_col = Comment.like_count
    else:
        sort_col = Comment.commented_at

    if order == "asc":
        query = query.order_by(asc(sort_col), asc(Comment.id))
    else:
        query = query.order_by(desc(sort_col), desc(Comment.id))

    comments = query.offset((page - 1) * page_size).limit(page_size).all()
    items = [CommentItemResponse.model_validate(c) for c in comments]

    return PaginatedCommentsResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.delete("/{analysis_id}")
def delete_analysis(
    analysis_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analisis tidak ditemukan atau Anda tidak memiliki akses.",
        )

    title = analysis.title
    db.delete(analysis)

    # Activity log
    log = ActivityLog(user_id=current_user.id, action=f"DELETE_ANALYSIS:{analysis_id}")
    db.add(log)

    db.commit()

    return {"message": f"Analisis '{title}' berhasil dihapus."}


@router.post("/{analysis_id}/run", response_model=AnalysisRunResponse)
def run_analysis(
    analysis_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    classifier: SentimentClassifier = Depends(get_sentiment_classifier),
):
    """
    Menjalankan pipeline analisis inti (preprocessing, prediksi model sentimen, dan ekstraksi kata kunci).
    Bersifat idempoten (menimpa hasil analisis sebelumnya jika dijalankan ulang).
    TODO: Di Fase 2C / fase berikutnya, tugas komputasi berat ini dapat dialihkan ke background tasks.
    """
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analisis tidak ditemukan atau Anda tidak memiliki akses.",
        )

    comments = (
        db.query(Comment)
        .filter(Comment.analysis_id == analysis_id)
        .order_by(Comment.id)
        .all()
    )

    if not comments:
        return AnalysisRunResponse(
            analysis_id=analysis.id,
            status="done",
            total_comments_processed=0,
            model_version=classifier.model_version,
        )

    # 1. Preprocessing teks
    cleaned_texts: list[str] = []
    for comment in comments:
        cleaned = clean_text(comment.text_raw)
        comment.text_clean = cleaned
        cleaned_texts.append(cleaned)

    # 2. Inferensi model sentimen
    try:
        predictions = classifier.predict(cleaned_texts)
    except ModelNotAvailableError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Layanan analisis sentimen tidak tersedia: {exc.message}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat memproses sentimen: {exc}",
        ) from exc

    # 3. Simpan prediksi model (idempoten: hapus prediksi lama pada komentar ini jika ada)
    comment_ids = [c.id for c in comments]
    db.query(Prediction).filter(Prediction.comment_id.in_(comment_ids)).delete(
        synchronize_session=False
    )

    texts_by_label: dict[str, list[str]] = {"positif": [], "netral": [], "negatif": []}

    for comment, pred in zip(comments, predictions, strict=False):
        p = Prediction(
            comment_id=comment.id,
            label_model=pred.label,
            score=pred.score,
            model_version=classifier.model_version,
        )
        db.add(p)

        if pred.label in texts_by_label:
            texts_by_label[pred.label].append(comment.text_clean or "")

    # 4. Ekstraksi Top Kata Kunci (Unigram & Bigram)
    kw_dict = top_keywords(texts_by_label, n=10)

    # Hapus topik lama untuk analysis ini (idempoten)
    db.query(Topic).filter(Topic.analysis_id == analysis_id).delete(
        synchronize_session=False
    )

    for sentiment_label, kw_list in kw_dict.items():
        for kw, freq in kw_list:
            topic = Topic(
                analysis_id=analysis_id,
                keyword=kw,
                sentiment=sentiment_label,
                frequency=freq,
            )
            db.add(topic)

    analysis.status = "done"

    # Activity log
    log = ActivityLog(user_id=current_user.id, action=f"RUN_ANALYSIS:{analysis_id}")
    db.add(log)

    db.commit()

    return AnalysisRunResponse(
        analysis_id=analysis.id,
        status="done",
        total_comments_processed=len(comments),
        model_version=classifier.model_version,
    )


@router.get("/{analysis_id}/results", response_model=AnalysisResultsResponse)
def get_analysis_results(
    analysis_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Mengambil hasil ringkasan model sentimen (distribusi, top keywords, model version, dan agreement rate).
    """
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analisis tidak ditemukan atau Anda tidak memiliki akses.",
        )

    preds_with_file_label = (
        db.query(Prediction, Comment.label)
        .join(Comment, Prediction.comment_id == Comment.id)
        .filter(Comment.analysis_id == analysis_id)
        .all()
    )

    if not preds_with_file_label:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Analisis belum dijalankan. Silakan jalankan analisis terlebih "
                "dahulu melalui POST /api/analyses/{id}/run."
            ),
        )

    total = len(preds_with_file_label)
    pos_count = sum(1 for p, _ in preds_with_file_label if p.label_model == "positif")
    neu_count = sum(1 for p, _ in preds_with_file_label if p.label_model == "netral")
    neg_count = sum(1 for p, _ in preds_with_file_label if p.label_model == "negatif")

    distribution = LabelDistribution(
        positive=pos_count,
        neutral=neu_count,
        negative=neg_count,
        positive_percent=round((pos_count / total) * 100) if total > 0 else 0,
        neutral_percent=round((neu_count / total) * 100) if total > 0 else 0,
        negative_percent=round((neg_count / total) * 100) if total > 0 else 0,
    )

    # Ambil top topics
    topics = (
        db.query(Topic)
        .filter(Topic.analysis_id == analysis_id)
        .order_by(desc(Topic.frequency))
        .all()
    )

    sentiment_keywords = SentimentKeywords(
        positif=[
            TopicItem(keyword=t.keyword, frequency=t.frequency)
            for t in topics
            if t.sentiment == "positif"
        ],
        netral=[
            TopicItem(keyword=t.keyword, frequency=t.frequency)
            for t in topics
            if t.sentiment == "netral"
        ],
        negatif=[
            TopicItem(keyword=t.keyword, frequency=t.frequency)
            for t in topics
            if t.sentiment == "negatif"
        ],
    )

    # Hitung persentase kecocokan jika dataset asli memiliki label bawaan
    agreement: float | None = None
    if analysis.has_label:
        matches = sum(
            1
            for p, file_label in preds_with_file_label
            if file_label and file_label.lower().strip() == p.label_model
        )
        agreement = round((matches / total) * 100, 2) if total > 0 else 0.0

    model_ver = preds_with_file_label[0][0].model_version if preds_with_file_label else "v1.0.0"

    return AnalysisResultsResponse(
        analysis_id=analysis.id,
        model_version=model_ver,
        distribution=distribution,
        top_keywords=sentiment_keywords,
        agreement_with_file_label=agreement,
    )

