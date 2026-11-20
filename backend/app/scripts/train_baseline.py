import argparse
import json
import logging
import sys
from datetime import UTC, datetime
from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

# Tambahkan backend ke sys.path jika script dijalankan langsung
backend_dir = Path(__file__).resolve().parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.services.preprocessing import clean_text  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("train_baseline")


def load_dataset(csv_path: Path) -> tuple[pd.Series, pd.Series]:
    """Membaca CSV dan mengembalikan (X_raw, y)."""
    df = pd.read_csv(csv_path)

    # Identifikasi kolom teks komentar
    text_col = None
    for candidate in ["comment_text", "text", "komentar", "comment"]:
        if candidate in df.columns:
            text_col = candidate
            break

    if not text_col:
        # Gunakan kolom teks pertama yang ditemukan
        text_cols = df.select_dtypes(include=["object"]).columns
        if len(text_cols) == 0:
            raise ValueError("Tidak ditemukan kolom teks pada file CSV.")
        text_col = text_cols[0]

    # Identifikasi kolom label
    label_col = None
    for candidate in ["label", "sentiment", "sentimen"]:
        if candidate in df.columns:
            label_col = candidate
            break

    if not label_col:
        raise ValueError("Kolom label ('label' atau 'sentiment') tidak ditemukan pada CSV.")

    # Bersihkan NaN
    df = df.dropna(subset=[text_col, label_col])
    df[label_col] = df[label_col].astype(str).str.lower().str.strip()

    # Filter hanya label valid: positif, netral, negatif
    valid_labels = {"positif", "netral", "negatif"}
    df = df[df[label_col].isin(valid_labels)]

    return df[text_col], df[label_col]


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Melatih model baseline sentimen analisis komentar Instagram "
            "(TF-IDF + LogisticRegression)."
        )
    )
    parser.add_argument(
        "--csv",
        type=str,
        required=True,
        help="Path ke file dataset CSV berlabel (wajib memiliki kolom teks dan label).",
    )
    parser.add_argument(
        "--out",
        type=str,
        default=str(backend_dir / "app" / "ml" / "models"),
        help="Direktori penyimpanan artifact model (default: app/ml/models).",
    )
    parser.add_argument(
        "--version",
        type=str,
        default="v1.0.0",
        help="Nomor versi model (default: v1.0.0).",
    )
    args = parser.parse_args()

    csv_path = Path(args.csv)
    if not csv_path.exists():
        logger.error("File CSV tidak ditemukan: %s", csv_path)
        sys.exit(1)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"=== Pelatihan Model Sentimen Baseline ({args.version}) ===")
    print(f"Membaca dataset dari: {csv_path}")

    X_raw, y = load_dataset(csv_path)
    total_rows = len(X_raw)
    print(f"Total baris valid: {total_rows}")

    if total_rows < 1000:
        print("\n" + "=" * 80)
        print("PERINGATAN: Jumlah data latih (< 1000 baris) terlalu sedikit untuk model produksi.")
        print("Model ini hanya untuk baseline pengembangan.")
        print("=" * 80 + "\n")

    print("Membersihkan teks dengan clean_text (preprocessing)...")
    X_clean = [clean_text(t) for t in X_raw]

    # Split dataset 70% train, 15% validation, 15% test
    try:
        X_train, X_temp, y_train, y_temp = train_test_split(
            X_clean, y, test_size=0.30, random_state=42, stratify=y
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.50, random_state=42, stratify=y_temp
        )
    except Exception as exc:
        logger.warning("Stratified split gagal (%s), beralih ke random split standar.", exc)
        X_train, X_temp, y_train, y_temp = train_test_split(
            X_clean, y, test_size=0.30, random_state=42
        )
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=0.50, random_state=42
        )

    print(f"Jumlah data - Train: {len(X_train)}, Val: {len(X_val)}, Test: {len(X_test)}")

    # Buat pipeline TF-IDF + Logistic Regression
    pipeline = Pipeline(
        [
            (
                "tfidf",
                TfidfVectorizer(
                    ngram_range=(1, 2),
                    min_df=1,
                    max_df=0.95,
                    sublinear_tf=True,
                ),
            ),
            (
                "clf",
                LogisticRegression(
                    class_weight="balanced",
                    max_iter=1000,
                    random_state=42,
                    C=1.0,
                ),
            ),
        ]
    )

    print("Melatih pipeline...")
    pipeline.fit(X_train, y_train)

    print("\n--- Evaluasi pada Test Set ---")
    y_pred = pipeline.predict(X_test)

    report_dict = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
    report_text = classification_report(y_test, y_pred, zero_division=0)
    print(report_text)

    macro_f1 = f1_score(y_test, y_pred, average="macro", zero_division=0)
    labels = sorted(list(set(y)))
    cm = confusion_matrix(y_test, y_pred, labels=labels)

    print("Confusion Matrix:")
    print(f"Labels: {labels}")
    print(cm)

    # Simpan pipeline
    pipeline_file = out_dir / "pipeline.joblib"
    joblib.dump(pipeline, pipeline_file)
    print(f"\nModel pipeline berhasil disimpan di: {pipeline_file}")

    # Simpan metadata
    metadata = {
        "model_version": args.version,
        "trained_at": datetime.now(UTC).isoformat(),
        "total_samples": total_rows,
        "train_samples": len(X_train),
        "val_samples": len(X_val),
        "test_samples": len(X_test),
        "accuracy": float(report_dict.get("accuracy", 0.0)),
        "macro_f1": float(macro_f1),
        "metrics_per_class": {
            cls: {
                "precision": float(report_dict[cls]["precision"]),
                "recall": float(report_dict[cls]["recall"]),
                "f1_score": float(report_dict[cls]["f1-score"]),
                "support": int(report_dict[cls]["support"]),
            }
            for cls in labels
            if cls in report_dict
        },
        "labels": labels,
    }

    metadata_file = out_dir / "metadata.json"
    with open(metadata_file, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata berhasil disimpan di: {metadata_file}")


if __name__ == "__main__":
    main()
