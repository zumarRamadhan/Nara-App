from pathlib import Path

import pytest

from app.services.sentiment_service import (
    ModelNotAvailableError,
    Prediction,
    SklearnSentimentClassifier,
)


def test_prediction_dataclass():
    p = Prediction(label="positif", score=0.95)
    assert p.label == "positif"
    assert p.score == 0.95


def test_sentiment_service_model_not_found():
    with pytest.raises(ModelNotAvailableError):
        SklearnSentimentClassifier(
            model_path=Path("non_existent_model.joblib"),
            metadata_path=Path("non_existent_meta.json"),
        )


def test_sentiment_service_prediction():
    # Model baseline sudah kita latih dan simpan di app/ml/models/pipeline.joblib
    classifier = SklearnSentimentClassifier()
    assert classifier.model_version is not None

    texts = [
        "produk ini sangat bagus dan mantap",
        "kecewa sekali barang rusak dan jelek",
    ]
    preds = classifier.predict(texts)

    assert len(preds) == 2
    for p in preds:
        assert p.label in ["positif", "netral", "negatif"]
        assert 0.0 <= p.score <= 1.0


def test_sentiment_service_empty_input():
    classifier = SklearnSentimentClassifier()
    assert classifier.predict([]) == []
    # Test jika teks berisi string kosong
    preds = classifier.predict(["", "   "])
    assert len(preds) == 2
