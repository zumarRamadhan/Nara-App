import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

import joblib

logger = logging.getLogger(__name__)

DEFAULT_MODEL_DIR = Path(__file__).parent.parent / "ml" / "models"


class ModelNotAvailableError(Exception):
    """Exception yang dilemparkan saat model machine learning tidak ditemukan atau tidak dapat dimuat."""

    def __init__(self, message: str = "Model sentimen belum tersedia atau belum dilatih.") -> None:
        self.message = message
        super().__init__(message)


@dataclass(frozen=True)
class Prediction:
    label: str  # "positif" | "netral" | "negatif"
    score: float  # Keyakinan/probabilitas (0.0 - 1.0)


class SentimentClassifier(Protocol):
    """Protokol antarmuka untuk classifier sentimen."""

    def predict(self, texts: list[str]) -> list[Prediction]:
        """Melakukan prediksi sentimen untuk daftar teks bersih."""
        ...

    @property
    def model_version(self) -> str:
        """Versi model yang sedang aktif."""
        ...


class SklearnSentimentClassifier:
    """Implementasi SentimentClassifier menggunakan scikit-learn pipeline (TF-IDF + LogisticRegression)."""

    def __init__(
        self,
        model_path: Path | str | None = None,
        metadata_path: Path | str | None = None,
    ) -> None:
        self._model_path = Path(model_path) if model_path else DEFAULT_MODEL_DIR / "pipeline.joblib"
        self._metadata_path = Path(metadata_path) if metadata_path else DEFAULT_MODEL_DIR / "metadata.json"
        self._pipeline: Any = None
        self._metadata: dict[str, Any] = {}
        self._load_model()

    def _load_model(self) -> None:
        if not self._model_path.exists():
            raise ModelNotAvailableError(
                f"File model tidak ditemukan di {self._model_path}. Latih model terlebih dahulu."
            )

        try:
            self._pipeline = joblib.load(self._model_path)
        except Exception as exc:
            raise ModelNotAvailableError(
                f"Gagal memuat file model dari {self._model_path}: {exc}"
            ) from exc

        if self._metadata_path.exists():
            try:
                with open(self._metadata_path, encoding="utf-8") as f:
                    self._metadata = json.load(f)
            except Exception as exc:
                logger.warning("Gagal membaca metadata model di %s: %s", self._metadata_path, exc)
                self._metadata = {"model_version": "v1.0.0"}
        else:
            self._metadata = {"model_version": "v1.0.0"}

    @property
    def model_version(self) -> str:
        return self._metadata.get("model_version", "v1.0.0")

    def predict(self, texts: list[str]) -> list[Prediction]:
        if self._pipeline is None:
            raise ModelNotAvailableError("Model belum siap digunakan.")

        if not texts:
            return []

        # Tangani teks kosong atau teks yang hanya berisi spasi
        # Pipeline scikit-learn memerlukan input non-empty per string,
        # jika string kosong TF-IDF memberi vektor nol
        safe_texts = [t if (t and t.strip()) else "netral" for t in texts]

        try:
            preds = self._pipeline.predict(safe_texts)
            has_proba = hasattr(self._pipeline, "predict_proba")
            probas = self._pipeline.predict_proba(safe_texts) if has_proba else None
        except Exception as exc:
            raise RuntimeError(f"Gagal menjalankan inferensi model: {exc}") from exc

        results: list[Prediction] = []
        for i, pred in enumerate(preds):
            pred_label = str(pred).lower().strip()
            score = 1.0
            if probas is not None:
                score = float(max(probas[i]))
            results.append(Prediction(label=pred_label, score=round(score, 4)))

        return results


def get_sentiment_classifier() -> SentimentClassifier:
    """
    Dependency provider untuk FastAPI.
    Dapat di-override pada pytest fixtures (app.dependency_overrides).
    """
    return SklearnSentimentClassifier()
