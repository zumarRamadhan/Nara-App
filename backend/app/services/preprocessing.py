import json
import re
import string
from functools import lru_cache
from pathlib import Path

from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory

# Kata negasi bahasa Indonesia yang WAJIB dipertahankan (tidak boleh dibuang sebagai stopword)
NEGATION_WORDS: frozenset[str] = frozenset({
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
})

# Kamus emoji ke token sentimen
EMOJI_SENTIMENT_MAP: dict[str, str] = {
    # Positif
    "😊": " emopos ",
    "😀": " emopos ",
    "😃": " emopos ",
    "😄": " emopos ",
    "😁": " emopos ",
    "😆": " emopos ",
    "😅": " emopos ",
    "🤣": " emopos ",
    "😂": " emopos ",
    "🙂": " emopos ",
    "🙃": " emopos ",
    "😉": " emopos ",
    "😇": " emopos ",
    "🥰": " emopos ",
    "😍": " emopos ",
    "🤩": " emopos ",
    "😘": " emopos ",
    "😗": " emopos ",
    "😚": " emopos ",
    "😙": " emopos ",
    "😋": " emopos ",
    "😛": " emopos ",
    "😜": " emopos ",
    "🤪": " emopos ",
    "😝": " emopos ",
    "🤗": " emopos ",
    "🤭": " emopos ",
    "👍": " emopos ",
    "👍🏻": " emopos ",
    "👍🏼": " emopos ",
    "👍🏽": " emopos ",
    "👍🏾": " emopos ",
    "👍🏿": " emopos ",
    "👏": " emopos ",
    "👏🏻": " emopos ",
    "👏🏼": " emopos ",
    "👏🏽": " emopos ",
    "👏🏾": " emopos ",
    "👏🏿": " emopos ",
    "🙌": " emopos ",
    "🫶": " emopos ",
    "❤️": " emopos ",
    "🧡": " emopos ",
    "💛": " emopos ",
    "💚": " emopos ",
    "💙": " emopos ",
    "💜": " emopos ",
    "🤎": " emopos ",
    "🤍": " emopos ",
    "💖": " emopos ",
    "💗": " emopos ",
    "💓": " emopos ",
    "💞": " emopos ",
    "💕": " emopos ",
    "💟": " emopos ",
    "❣️": " emopos ",
    "🔥": " emopos ",
    "✨": " emopos ",
    "🌟": " emopos ",
    "⭐": " emopos ",
    "💯": " emopos ",
    "🥳": " emopos ",
    "🎉": " emopos ",
    "🎊": " emopos ",
    "🤝": " emopos ",
    "🙏": " emopos ",
    "😎": " emopos ",
    "😻": " emopos ",
    # Negatif
    "😞": " emoneg ",
    "😔": " emoneg ",
    "😟": " emoneg ",
    "😕": " emoneg ",
    "🙁": " emoneg ",
    "☹️": " emoneg ",
    "😣": " emoneg ",
    "😖": " emoneg ",
    "😫": " emoneg ",
    "😩": " emoneg ",
    "🥺": " emoneg ",
    "😢": " emoneg ",
    "😭": " emoneg ",
    "😤": " emoneg ",
    "😠": " emoneg ",
    "😡": " emoneg ",
    "🤬": " emoneg ",
    "🤯": " emoneg ",
    "😳": " emoneg ",
    "🥵": " emoneg ",
    "🥶": " emoneg ",
    "😱": " emoneg ",
    "😨": " emoneg ",
    "😰": " emoneg ",
    "😥": " emoneg ",
    "😓": " emoneg ",
    "🤢": " emoneg ",
    "🤮": " emoneg ",
    "🤧": " emoneg ",
    "😷": " emoneg ",
    "🤒": " emoneg ",
    "🤕": " emoneg ",
    "🥱": " emoneg ",
    "💩": " emoneg ",
    "👎": " emoneg ",
    "👎🏻": " emoneg ",
    "👎🏼": " emoneg ",
    "👎🏽": " emoneg ",
    "👎🏾": " emoneg ",
    "👎🏿": " emoneg ",
    "💔": " emoneg ",
    "🤦": " emoneg ",
    "🤦‍♂️": " emoneg ",
    "🤦‍♀️": " emoneg ",
    "🤷": " emoneg ",
    "🤷‍♂️": " emoneg ",
    "🤷‍♀️": " emoneg ",
    "💀": " emoneg ",
    "☠️": " emoneg ",
    "👿": " emoneg ",
    "👺": " emoneg ",
}

# Regex yang sudah dikompilasi
_URL_REGEX = re.compile(r"https?://\S+|www\.\S+")
_MENTION_REGEX = re.compile(r"@[A-Za-z0-9_.-]+")
_HASHTAG_REGEX = re.compile(r"#([A-Za-z0-9_]+)")
_STANDALONE_NUMBER_REGEX = re.compile(r"\b\d+\b")
_REPEATED_CHARS_REGEX = re.compile(r"(.)\1{2,}")
_WHITESPACE_REGEX = re.compile(r"\s+")
_NON_ASCII_REMOVER = re.compile(r"[^\x00-\x7F]+")


@lru_cache(maxsize=1)
def get_sastrawi_stemmer():
    """Inisialisasi lazy singleton stemmer Sastrawi."""
    factory = StemmerFactory()
    return factory.create_stemmer()


@lru_cache(maxsize=1)
def get_stopwords() -> frozenset[str]:
    """Mengambil daftar stopword Sastrawi tanpa kata negasi."""
    factory = StopWordRemoverFactory()
    words = factory.get_stop_words()
    # Pastikan kata negasi TIDAK dibuang
    filtered = {w for w in words if w not in NEGATION_WORDS}
    return frozenset(filtered)


@lru_cache(maxsize=1)
def get_slang_dict() -> dict[str, str]:
    """Membaca kamus slang bahasa Indonesia dari app/resources/slang_id.json."""
    resource_path = Path(__file__).parent.parent / "resources" / "slang_id.json"
    if not resource_path.exists():
        return {}
    with open(resource_path, encoding="utf-8") as f:
        return json.load(f)


def _convert_emojis(text: str) -> str:
    """Mengonversi emoji positif/negatif ke token emopos/emoneg dan membuang karakter non-ASCII lainnya."""
    for emoji_char, token in EMOJI_SENTIMENT_MAP.items():
        if emoji_char in text:
            text = text.replace(emoji_char, token)
    # Hapus sisa emoji / karakter non-ASCII lain
    text = _NON_ASCII_REMOVER.sub(" ", text)
    return text


def clean_text(text: str | None) -> str:
    """
    Membersihkan teks komentar bahasa Indonesia dengan urutan:
    1. Case folding
    2. Konversi emoji ke token emopos / emoneg (lainnya dibuang)
    3. Hapus URL
    4. Hapus mention (@nama)
    5. Hapus tanda # tetapi pertahankan katanya
    6. Hapus angka yang berdiri sendiri
    7. Rapikan huruf berulang (mantaaaap -> mantap, batas 2 huruf)
    8. Normalisasi kata gaul/singkatan lewat kamus slang
    9. Hapus tanda baca
    10. Hapus stopword (kata negasi dipertahankan)
    11. Stemming Sastrawi
    12. Menghasilkan string bersih (jika kosong menghasilkan "").
    """
    if not text or not isinstance(text, str):
        return ""

    # 1. Case folding
    text = text.lower()

    # 2. Emoji to sentiment tokens & remove other non-ascii
    text = _convert_emojis(text)

    # 3. Hapus URL
    text = _URL_REGEX.sub(" ", text)

    # 4. Hapus mention (@user)
    text = _MENTION_REGEX.sub(" ", text)

    # 5. Hapus tanda # tetapi pertahankan kata
    text = _HASHTAG_REGEX.sub(r" \1 ", text)

    # 6. Hapus angka yang berdiri sendiri
    text = _STANDALONE_NUMBER_REGEX.sub(" ", text)

    # 7. Rapikan huruf berulang (mantaaaap -> mantap)
    text = _REPEATED_CHARS_REGEX.sub(r"\1", text)

    # 8. Normalisasi kata gaul/singkatan lewat kamus
    slang_dict = get_slang_dict()
    if slang_dict:
        # Pisahkan frasa multi-kata dan kata tunggal
        # Tangani multi-kata terlebih dahulu
        for slang, formal in slang_dict.items():
            if " " in slang and slang in text:
                text = re.sub(rf"\b{re.escape(slang)}\b", formal, text)

        tokens = text.split()
        normalized_tokens = [slang_dict.get(token, token) for token in tokens]
        text = " ".join(normalized_tokens)

    # 9. Hapus tanda baca
    # string.punctuation: !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
    # Ganti tanda baca dengan spasi agar tidak menggabungkan kata
    for char in string.punctuation:
        if char in text:
            text = text.replace(char, " ")

    # 10. Hapus stopword (dengan pengecualian kata negasi)
    stopwords = get_stopwords()
    tokens = text.split()
    tokens_no_stop = [w for w in tokens if w in NEGATION_WORDS or w not in stopwords]

    # 11. Stemming Sastrawi
    stemmer = get_sastrawi_stemmer()
    stemmed_tokens: list[str] = []
    for token in tokens_no_stop:
        # Jangan stem token sentimen khusus
        if token in {"emopos", "emoneg"}:
            stemmed_tokens.append(token)
        elif token in NEGATION_WORDS:
            stemmed_tokens.append(token)
        else:
            stemmed_word = stemmer.stem(token)
            if stemmed_word:
                stemmed_tokens.append(stemmed_word)

    # 12. Gabungkan kembali dan rapikan spasi ganda
    cleaned = " ".join(stemmed_tokens)
    cleaned = _WHITESPACE_REGEX.sub(" ", cleaned).strip()

    return cleaned
