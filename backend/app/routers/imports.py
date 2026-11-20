import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.schemas.import_schema import ColumnMapping, ImportResponse
from app.services.auth_service import get_current_user
from app.services.import_service import process_import_file

router = APIRouter(prefix="/api/imports", tags=["Imports"])

CSV_TEMPLATE_CONTENT = """comment_text,timestamp,username,like_count,post_title
"Kopi susunya mantap bgt gula arennya pas!",2026-11-17 10:15,dinda_safira99,14,Promo Akhir Pekan
"Pelayanan ramah bgt baristanya cepat",2026-11-17 11:02,clarissa.andrea,8,Promo Akhir Pekan
"Antrean cabang Tebet tolong ditambah kasirnya",2026-11-17 10:22,budi_santoso_id,5,Promo Akhir Pekan
"Worth it bgt promo buy 1 get 1!",2026-11-17 12:05,gilang_ramadhan,23,Promo Akhir Pekan
"Sayang cup matcha oat milknya habis pas siang",2026-11-17 11:18,reza_aditya_pratama,11,Promo Akhir Pekan
"Tempatnya nyaman buat wfc adem wifi kenceng",2026-11-17 13:40,siti_nurhaliza,19,Promo Akhir Pekan
"Sedotan kertas tolong diperkuat gampang lembek",2026-11-17 14:10,arief_kurniawan,3,Promo Akhir Pekan
"Cokelatnya pekat ga kemanisan suka bgt",2026-11-17 15:05,maya_indira,16,Promo Akhir Pekan
"""


@router.get("/template", response_class=PlainTextResponse)
def get_import_template():
    return PlainTextResponse(
        content=CSV_TEMPLATE_CONTENT,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="nara-template.csv"'},
    )


@router.post("", response_model=ImportResponse)
async def upload_import_file(
    file: UploadFile = File(...),
    mapping: str = Form(..., description="JSON string pemetaan kolom"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        mapping_dict = json.loads(mapping)
        col_mapping = ColumnMapping(**mapping_dict)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format JSON mapping kolom tidak valid: {e!s}",
        ) from e

    result = await process_import_file(
        db=db,
        user=current_user,
        file=file,
        mapping=col_mapping,
    )

    return ImportResponse(
        id=result["id"],
        total_comments=result["total_comments"],
        has_label=result["has_label"],
        ignored_labels_count=result["ignored_labels_count"],
    )
