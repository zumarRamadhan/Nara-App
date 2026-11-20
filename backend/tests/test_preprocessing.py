from app.services.preprocessing import clean_text


def test_clean_text_preserves_negation():
    negations = [
        "tidak",
        "tak",
        "bukan",
        "belum",
        "jangan",
        "kurang",
        "nggak",
        "gak",
        "ga",
        "enggak",
        "tanpa",
    ]
    for neg in negations:
        text = f"produk ini {neg} bagus"
        cleaned = clean_text(text)
        # Kata negasi atau variannya harus tetap ada dalam teks bersih
        assert any(n in cleaned for n in ["tidak", "bukan", "belum", "jangan", "kurang", "tanpa", neg]), (
            f"Negation word '{neg}' was removed!"
        )


def test_clean_text_emoji_mapping():
    # Positif
    pos_res = clean_text("Pelayanan bagus banget 👍 🥰 🔥")
    assert "emopos" in pos_res
    assert "👍" not in pos_res
    assert "🥰" not in pos_res
    assert "🔥" not in pos_res

    # Negatif
    neg_res = clean_text("Barang rusak mengecewakan 👎 😡 💔")
    assert "emoneg" in neg_res
    assert "👎" not in neg_res
    assert "😡" not in neg_res
    assert "💔" not in neg_res


def test_clean_text_repeated_chars():
    cleaned = clean_text("Mantaaaap banggggettt kereeeen")
    assert "mantap" in cleaned
    assert "keren" in cleaned


def test_clean_text_removes_urls_and_mentions():
    text = "Cek postingan di https://instagram.com/p/123/ dan follow @tokoberkah"
    cleaned = clean_text(text)
    assert "http" not in cleaned
    assert "instagram" not in cleaned
    assert "@" not in cleaned
    assert "tokoberkah" not in cleaned


def test_clean_text_preserves_hashtag_word():
    text = "Sangat puas #mantap #keren"
    cleaned = clean_text(text)
    assert "#" not in cleaned
    assert "mantap" in cleaned
    assert "keren" in cleaned


def test_clean_text_standalone_numbers():
    text = "Beli 2 barang dapet 10 diskon"
    cleaned = clean_text(text)
    words = cleaned.split()
    assert "2" not in words
    assert "10" not in words


def test_clean_text_empty_and_spaces_safe():
    assert clean_text("") == ""
    assert clean_text("    ") == ""
    assert clean_text(None) == ""
