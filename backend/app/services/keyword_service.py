from collections import Counter


def top_keywords(
    texts_by_label: dict[str, list[str]],
    n: int = 10,
) -> dict[str, list[tuple[str, int]]]:
    """
    Mengekstrak top N kata kunci (unigram dan bigram) paling sering muncul untuk setiap label sentimen.

    Ketentuan:
    - Mengabaikan token sentimen khusus: 'emopos', 'emoneg'
    - Mengabaikan kata dengan panjang < 3 karakter
    - Menggabungkan frekuensi unigram dan bigram yang bermakna
    - Mengembalikan dict berisi list tuple (keyword, frekuensi) terurut menurun per label.
    """
    ignored_tokens = {"emopos", "emoneg"}
    results: dict[str, list[tuple[str, int]]] = {}

    for label, texts in texts_by_label.items():
        counter: Counter[str] = Counter()

        for text in texts:
            if not text or not isinstance(text, str):
                continue

            words = [
                w.strip()
                for w in text.split()
                if w.strip() not in ignored_tokens and len(w.strip()) >= 3
            ]

            # 1. Hitung Unigram
            for word in words:
                counter[word] += 1

            # 2. Hitung Bigram
            for i in range(len(words) - 1):
                bigram = f"{words[i]} {words[i + 1]}"
                counter[bigram] += 1

        # Ambil top N paling sering
        results[label] = counter.most_common(n)

    return results
