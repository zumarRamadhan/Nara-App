# PRD – Nara: Analisis Sentimen Komentar Instagram lewat Tautan Postingan
Proyek Rekognisi Tugas Akhir – Program Studi Sistem Informasi Nama produk: Nara Versi: 2.0 (fokus Instagram, input tautan) · Tanggal: 18 November 2026

## 1. Ringkasan Produk
Nara adalah aplikasi web yang membantu pemilik bisnis dan pengelola media sosial memahami opini audiens dari komentar Instagram. Pengguna cukup menempelkan tautan postingan (feed atau reel), lalu Nara mengambil komentarnya, mengklasifikasikan setiap komentar menjadi positif, negatif, atau netral, mengekstrak topik yang sering muncul, dan menampilkan hasilnya di dashboard serta laporan yang dapat diunduh.
Versi ini hanya mendukung Instagram. Pengambilan komentar memakai Instagram API resmi (Meta), sehingga pengguna perlu menghubungkan akun Instagram profesional miliknya satu kali sebelum menempelkan tautan.

## 2. Latar Belakang dan Masalah
Pengelola akun bisnis menerima banyak komentar, tetapi membacanya satu per satu memakan waktu dan sering terlewat.
Belum ada ringkasan terstruktur tentang apa yang dikeluhkan atau disukai audiens pada setiap postingan atau iklan.
Alat analisis sentimen yang ada umumnya berbahasa Inggris, berbayar, atau rumit. Bahasa Indonesia informal (singkatan, bahasa gaul, emoji) menurunkan akurasinya.
Keputusan konten dan iklan sering diambil berdasarkan intuisi, bukan data opini audiens.
Pernyataan masalah: pengelola akun Instagram bisnis kecil membutuhkan cara yang sangat sederhana (cukup tempel tautan) untuk memahami sentimen dan topik komentar berbahasa Indonesia, tanpa keahlian data science.

## 3. Tujuan dan Metrik Keberhasilan
Tujuan produk:
- Mengubah satu tautan postingan Instagram menjadi analisis sentimen dalam satu alur singkat.
- Mengklasifikasikan sentimen komentar berbahasa Indonesia dengan akurasi yang dapat dipertanggungjawabkan.
- Menampilkan topik dan kata kunci dominan per sentimen.
- Divalidasi pada studi kasus akun bisnis nyata.

## 4. Target Pengguna
- Pengguna utama: Pemilik UMKM dan pengelola akun Instagram bisnis atau kreator (social media specialist, admin toko online).
- Pengguna sekunder: Tim pemasaran kecil yang mengevaluasi kampanye dan iklan.

## 5. Batasan Platform Instagram (Penting)
- Hanya akun profesional: Instagram API hanya melayani akun Business atau Creator. Akun pribadi tidak didukung.
- Hanya postingan milik akun yang terhubung: API resmi mengizinkan pengambilan komentar pada media milik akun profesional yang menghubungkan dirinya ke aplikasi. Komentar pada postingan akun lain tidak dapat diambil lewat jalur resmi.
- Perlu login dan izin pengguna: Pengguna menghubungkan akun lewat OAuth Instagram.
- Tidak memakai scraping: Nara tidak mengambil data dengan scraping.

## 6. Ruang Lingkup
### In Scope
- Registrasi dan login pengguna Nara.
- Menghubungkan akun Instagram profesional lewat OAuth resmi.
- Input utama: tempel tautan postingan Instagram (format /p/ dan /reel/).
- Pengambilan komentar (termasuk balasan) dari postingan lewat Instagram API.
- Pra-pemrosesan teks bahasa Indonesia.
- Klasifikasi sentimen tiga kelas dan skor keyakinan.
- Ekstraksi kata kunci dan topik dominan.
- Dashboard hasil per postingan, riwayat analisis, dan perbandingan antar postingan.
- Koreksi label manual oleh pengguna.
- Ekspor laporan PDF dan data CSV.

### Out of Scope (Versi 1.0)
- Platform selain Instagram.
- Analisis komentar dari akun yang tidak terhubung.
- Scraping atau cara pengambilan data di luar API resmi.
- Membalas, menyembunyikan, atau menghapus komentar dari dalam Nara.
- Analisis gambar, video, dan DM.
- Aplikasi mobile native.
