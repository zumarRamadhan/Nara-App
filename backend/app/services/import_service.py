import io
import re
from datetime import datetime
from typing import Any

import pandas as pd
from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.activity_log import ActivityLog
from app.models.analysis import Analysis
from app.models.comment import Comment
from app.models.user import User
from app.schemas.import_schema import ColumnMapping

MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB
MAX_ROWS = 10000
MAX_TEXT_LENGTH = 2000

VALID_LABELS = {"positif", "netral", "negatif"}


def normalize_label(val: Any) -> tuple[str | None, bool]:
    """
    Returns (normalized_label, was_ignored)
    """
    if pd.isna(val) or val is None:
        return None, False
    s = str(val).strip().lower()
    if not s:
        return None, False

    if "positif" in s or s in {"positive", "pos"}:
        return "positif", False
    elif "negatif" in s or s in {"negative", "neg"}:
        return "negatif", False
    elif "netral" in s or s in {"neutral", "neu"}:
        return "netral", False
    else:
        # Invalid / unrecognized label
        return None, True


def parse_timestamp_tolerant(val: Any) -> datetime | None:
    if pd.isna(val) or val is None:
        return None
    s = str(val).strip()
    if not s or s == "-":
        return None
    try:
        dt = pd.to_datetime(s, errors="coerce")
        if pd.isna(dt):
            return None
        return dt.to_pydatetime()
    except Exception:
        return None


def parse_like_count(val: Any) -> int:
    if pd.isna(val) or val is None:
        return 0
    try:
        val_str = str(val).strip()
        cleaned = re.sub(r"[^\d]", "", val_str)
        if not cleaned:
            return 0
        return int(cleaned)
    except Exception:
        return 0


async def process_import_file(
    db: Session,
    user: User,
    file: UploadFile,
    mapping: ColumnMapping,
) -> dict[str, Any]:
    # 1. Validasi ekstensi nama file
    filename = file.filename or "unknown.csv"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ["csv", "xlsx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Format file tidak didukung. Harap unggah file berformat .CSV atau .XLSX.",
        )

    # 2. Baca isi file & validasi ukuran
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Ukuran file melebihi batas 5 MB (ukuran file: {(len(content) / (1024 * 1024)):.1f} MB).",
        )

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File kosong tidak memiliki data.",
        )

    # 3. Parsing DataFrame via pandas
    buffer = io.BytesIO(content)
    try:
        if ext == "csv":
            df = pd.read_csv(buffer, skip_blank_lines=True)
        else:
            df = pd.read_excel(buffer, engine="openpyxl")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gagal membaca struktur file. Pastikan format berkas valid dan tidak rusak.",
        ) from None

    if df.empty or len(df) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File kosong atau tidak memiliki baris data.",
        )

    # 4. Validasi jumlah baris
    if len(df) > MAX_ROWS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Jumlah baris ({len(df):,}) melebihi batas maksimum 10.000 baris. Harap perkecil file.",
        )

    # 5. Validasi keberadaan kolom wajib comment_text
    col_comment = mapping.comment_text.strip()
    if col_comment not in df.columns:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Kolom teks komentar '{col_comment}' tidak ditemukan dalam file.",
        )

    # Kolom opsional
    col_timestamp = (
        mapping.timestamp.strip()
        if mapping.timestamp and mapping.timestamp.strip() in df.columns
        else None
    )
    col_username = (
        mapping.username.strip()
        if mapping.username and mapping.username.strip() in df.columns
        else None
    )
    col_like = (
        mapping.like_count.strip()
        if mapping.like_count and mapping.like_count.strip() in df.columns
        else None
    )
    col_title = (
        mapping.post_title.strip()
        if mapping.post_title and mapping.post_title.strip() in df.columns
        else None
    )
    col_label = (
        mapping.label.strip()
        if mapping.label and mapping.label.strip() in df.columns
        else None
    )

    # 6. Iterasi baris data & validasi isi
    comments_to_insert = []
    ignored_labels_count = 0
    valid_labels_count = 0
    first_title = None

    for _, row in df.iterrows():
        raw_val = row[col_comment]
        if pd.isna(raw_val):
            continue
        text_str = str(raw_val).strip()
        if not text_str:
            continue

        # Potong teks maksimal 2.000 karakter
        truncated_text = text_str[:MAX_TEXT_LENGTH]

        # Timestamp
        commented_at = (
            parse_timestamp_tolerant(row[col_timestamp]) if col_timestamp else None
        )

        # Username
        username_val = (
            str(row[col_username]).strip().lstrip("@")
            if col_username and not pd.isna(row[col_username])
            else None
        )
        if username_val == "" or username_val == "-":
            username_val = None

        # Like count
        like_count = parse_like_count(row[col_like]) if col_like else 0

        # Post title
        post_title_val = (
            str(row[col_title]).strip()
            if col_title and not pd.isna(row[col_title])
            else None
        )
        if post_title_val and not first_title:
            first_title = post_title_val

        # Label sentimen
        label_val = None
        label_src = None
        if col_label:
            norm_lbl, was_ignored = normalize_label(row[col_label])
            if was_ignored:
                ignored_labels_count += 1
            if norm_lbl:
                label_val = norm_lbl
                label_src = "file"
                valid_labels_count += 1

        comments_to_insert.append(
            {
                "text_raw": truncated_text,
                "text_clean": None,
                "commented_at": commented_at,
                "username": username_val,
                "like_count": like_count,
                "post_title": post_title_val,
                "label": label_val,
                "label_source": label_src,
            }
        )

    total_valid_comments = len(comments_to_insert)
    if total_valid_comments == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tidak ada komentar yang valid untuk dianalisis dalam file.",
        )

    has_label = valid_labels_count > 0

    # 7. Simpan analisis & bulk insert komentar
    analysis_title = first_title or f"Impor Berkas: {filename}"
    analysis = Analysis(
        user_id=user.id,
        source_type="file_import",
        title=analysis_title,
        original_filename=filename,
        status="done",
        total_comments=total_valid_comments,
        has_label=has_label,
    )
    db.add(analysis)
    db.flush()

    comment_models = [
        Comment(
            analysis_id=analysis.id,
            text_raw=c["text_raw"],
            text_clean=c["text_clean"],
            commented_at=c["commented_at"],
            username=c["username"],
            like_count=c["like_count"],
            post_title=c["post_title"],
            label=c["label"],
            label_source=c["label_source"],
        )
        for c in comments_to_insert
    ]
    db.add_all(comment_models)

    # Activity log
    log = ActivityLog(user_id=user.id, action=f"IMPORT_FILE:{filename}")
    db.add(log)

    db.commit()
    db.refresh(analysis)

    return {
        "id": analysis.id,
        "total_comments": total_valid_comments,
        "has_label": has_label,
        "ignored_labels_count": ignored_labels_count,
    }
