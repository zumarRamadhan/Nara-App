# Nara Backend API (FastAPI + PostgreSQL)

Backend layanan Nara untuk autentikasi pengguna, penyimpanan data analisis, dan pemrosesan impor berkas komentar (CSV/XLSX) yang dirancang untuk mendukung integrasi model NLP (Fase 3) dan Instagram API (Fase 5).

---

## 1. Persyaratan Sistem
- Python 3.11+
- PostgreSQL 16 (melalui Docker Compose atau instance PostgreSQL lokal)

---

## 2. Struktur Proyek

```text
backend/
├── app/
│   ├── main.py                     # Entry point FastAPI & konfigurasi CORS
│   ├── core/
│   │   ├── config.py               # Konfigurasi pydantic-settings
│   │   ├── security.py             # Argon2 password hashing & JWT cookie
│   │   └── rate_limit.py           # In-memory rate limiting auth
│   ├── db/
│   │   ├── base.py                 # DeclarativeBase SQLAlchemy
│   │   └── session.py              # Engine & get_db dependency
│   ├── models/                     # Model SQLAlchemy (User, Analysis, Comment, ActivityLog)
│   ├── schemas/                    # Skema Pydantic (Auth, Import, Analysis)
│   ├── services/                   # Business logic (Auth, Import, Analysis)
│   ├── routers/                    # Router API (health, auth, imports, analyses)
│   └── scripts/
│       └── create_user.py          # Script CLI interaktif untuk membuat pengguna
├── alembic/                        # Skrip migrasi database
├── tests/                          # Pengujian otomatis (pytest)
│   └── fixtures/                   # Sampel berkas CSV uji
├── requirements.txt                # Dependensi produksi
├── requirements-dev.txt            # Dependensi dev & pengujian
├── pyproject.toml                  # Konfigurasi linter Ruff
├── .env.example                    # Template konfigurasi environment
└── .env                            # Konfigurasi lokal (diabaikan Git)
```

---

## 3. Langkah Instalasi & Menjalankan

### A. Siapkan Virtual Environment & Dependensi
```bash
cd backend
python -m venv .venv

# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1

# Linux / macOS:
source .venv/bin/activate

pip install -r requirements-dev.txt
```

### B. Konfigurasi Environment (.env)
Salin `.env.example` menjadi `.env` dan sesuaikan kredensial database:
```bash
cp .env.example .env
```
Isi konfigurasi dalam `backend/.env`:
```ini
DATABASE_URL=postgresql+psycopg://nara_user:nara_password@localhost:5432/nara_db
TEST_DATABASE_URL=postgresql+psycopg://nara_user:nara_password@localhost:5432/nara_test_db
JWT_SECRET=rahasia_acak_panjang_untuk_jwt_session
SESSION_HOURS=8
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```

### C. Menjalankan Database PostgreSQL
Gunakan Docker Compose dari root proyek:
```bash
# Dari root proyek:
docker compose up -d
```
*(Atau gunakan PostgreSQL service lokal yang aktif pada port 5432).*

### D. Menjalankan Migrasi Database (Alembic)
```bash
cd backend
alembic upgrade head
```

### E. Menjalankan Server Backend
```bash
uvicorn app.main:app --reload --port 8000
```
- Swagger UI (Dokumentasi Interaktif): [http://localhost:8000/docs](http://localhost:8000/docs)
- OpenAPI JSON: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 4. Script CLI Pembuatan Pengguna

Untuk membuat akun pengguna baru tanpa mengetikkan kata sandi di terminal atau kode:
```bash
python -m app.scripts.create_user --email admin@nara.id --name "Admin Nara"
```
Script akan meminta kata sandi secara interaktif via prompt tersembunyi (`getpass`).

---

## 5. Melatih Model Baseline Sentimen (Fase 2B)

Untuk melatih model baseline TF-IDF + Logistic Regression pada dataset komentar berlabel:
```bash
python -m app.scripts.train_baseline --csv tests/fixtures/nara-dummy-comments-labeled.csv --version v1.0.0
```
Artifact model (`pipeline.joblib` dan `metadata.json`) akan otomatis disimpan di direktori `app/ml/models/`.

---

## 6. Endpoint Analisis Inti (Fase 2B)

- `POST /api/analyses/{id}/run`: Menjalankan pipeline preprocessing teks, prediksi model sentimen, dan ekstraksi kata kunci teratas (idempoten).
- `GET /api/analyses/{id}/results`: Mengambil metrik distribusi sentimen model, kata kunci teratas (positif, netral, negatif), versi model, dan persentase kecocokan label jika dataset asli memiliki label bawaan.

---

## 7. Menjalankan Pengujian & Linter

```bash
# Menjalankan seluruh test suite otomatis:
pytest -v

# Menjalankan linter Ruff:
ruff check .
```

---

## 6. Catatan Keamanan Penting (Formula Injection)

> [!WARNING]
> Saat mengimplementasikan fitur ekspor CSV di fase berikutnya, seluruh nilai sel teks yang diawali dengan karakter formula spreadsheet (`=`, `+`, `-`, `@`, atau tab/CR) **WAJIB** di-escape dengan tanda kutip tunggal (`'`) di depannya untuk mencegah eksploitasi **CSV / Formula Injection** ketika file dibuka oleh aplikasi seperti Microsoft Excel atau Google Sheets.
