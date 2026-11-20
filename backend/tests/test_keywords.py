from app.services.keyword_service import top_keywords


def test_top_keywords_unigrams_and_bigrams():
    sample_data = {
        "positif": [
            "produk bagus kualitas sangat bagus emopos",
            "kualitas sangat bagus sekali emopos",
            "pengiriman cepat produk bagus",
        ],
        "netral": [
            "harga standar saja",
            "informasi kurang lengkap",
        ],
        "negatif": [
            "kecewa barang rusak parah emoneg",
            "barang rusak dan lelet emoneg",
        ],
    }

    keywords = top_keywords(sample_data, n=5)

    assert "positif" in keywords
    assert "netral" in keywords
    assert "negatif" in keywords

    # Pastikan emopos dan emoneg tidak masuk dalam top keywords
    all_keywords_positif = [k for k, _ in keywords["positif"]]
    assert "emopos" not in all_keywords_positif

    all_keywords_negatif = [k for k, _ in keywords["negatif"]]
    assert "emoneg" not in all_keywords_negatif

    # Kata dengan panjang < 3 karakter tidak boleh masuk
    for _label, items in keywords.items():
        for kw, _ in items:
            for part in kw.split():
                assert len(part) >= 3

    # Cek bahwa bigram atau unigram yang sering muncul terdeteksi
    assert any("bagus" in kw for kw in all_keywords_positif)
    assert any("rusak" in kw for kw in all_keywords_negatif)
