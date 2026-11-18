# Backend - Nara (FastAPI Service)

Folder ini disiapkan untuk service backend Nara yang akan dibangun menggunakan **FastAPI (Python)** pada fase berikutnya.

## Rencana Cakupan Backend (Fase Selanjutnya)
1. **Otentikasi & Akun:** OAuth 2.0 resmi Meta Graph API / Instagram Graph API untuk akun Business/Creator.
2. **Koleksi Komentar:** Pengambilan media, komentar, dan balasan postingan dengan penanganan rate limiting dan pagination.
3. **Pipeline NLP (Bahasa Indonesia):**
   - Normalisasi teks informal/slang dan emoji.
   - Stopword removal dan stemming (Sastrawi).
   - Klasifikasi sentimen 3-kelas (Positif, Netral, Negatif) + confidence score.
   - Ekstraksi topik (TF-IDF / BERTopic).
4. **Database:** PostgreSQL untuk menyimpan data pengguna, status token, riwayat analisis, dan hasil prediksi.
5. **REST API Endpoints:** Komunikasi data dengan frontend Next.js.
