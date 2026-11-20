from app.routers.analyses import router as analyses_router
from app.routers.auth import router as auth_router
from app.routers.health import router as health_router
from app.routers.imports import router as imports_router

__all__ = [
    "analyses_router",
    "auth_router",
    "health_router",
    "imports_router",
]
