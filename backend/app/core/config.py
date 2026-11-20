from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = (
        "postgresql+psycopg://nara_user:nara_password@localhost:5432/nara_db"
    )
    TEST_DATABASE_URL: str = (
        "postgresql+psycopg://nara_user:nara_password@localhost:5432/nara_test_db"
    )
    JWT_SECRET: str = "super_secret_jwt_key_for_development_purposes_only_jwt_2026"
    SESSION_HOURS: int = 8
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        if not self.CORS_ORIGINS:
            return ["http://localhost:3000"]
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()
        ]


settings = Settings()
