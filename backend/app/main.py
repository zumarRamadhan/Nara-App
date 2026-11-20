from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    analyses_router,
    auth_router,
    health_router,
    imports_router,
)

app = FastAPI(
    title="Nara API",
    version="0.2.0",
    description="API Backend Nara: Analisis Sentimen Komentar Instagram dan Impor Berkas",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(imports_router)
app.include_router(analyses_router)


@app.get("/")
def root():
    return {
        "app": "Nara API",
        "version": "0.2.0",
        "status": "active",
        "docs_url": "/docs",
    }
