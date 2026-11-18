# Asumsi dan Catatan Keputusan Teknis – Fase 1 (Nara)

Dokumen ini mencatat setiap asumsi, interpretasi, dan penyesuaian yang diambil selama pengerjaan Fase 1 (Frontend Foundation & Mock Data) berdasarkan `docs/PRD.md` dan `docs/design.md`.

## 1. Lingkup dan Batasan Fase 1
- **Fokus Tunggal:** Frontend berbasis Next.js App Router dengan data dummy realistis berbahasa Indonesia.
- **Backend:** Belum diimplementasikan. Folder `/backend` hanya berisi `README.md` placeholder yang menjelaskan arsitektur FastAPI mendatang.
- **Tidak ada API asli:** Tidak ada pemanggilan API Instagram, OAuth nyata, penyimpanan database, maupun inferensi model Machine Learning di Fase 1.

## 2. Asumsi Navigasi & Halaman
- **Rute Aktif di Fase 1:**
  1. `/` – Dashboard utama dengan input tempel tautan, metrik sentimen, grafik batang bertumpuk, kartu akun terhubung, dan tabel analisis terbaru.
  2. `/hasil/[id]` – Halaman hasil analisis detail satu postingan (menggunakan ID dummy seperti `ANL_000076`).
  3. `/hubungkan` – Halaman informasi dan tombol OAuth untuk menghubungkan akun Instagram Business/Creator (tombol belum memicu OAuth asli).
- **Tab Navigasi TopBar:**
  - `Ringkasan` & `Analisis` mengarah ke `/`.
  - `Akun` mengarah ke `/hubungkan`.
  - `Postingan`, `Bandingkan`, `Laporan` ditandai dengan interaksi terarah / modal informasi "Fitur ini akan aktif pada fase berikutnya".
- **SideRail:**
  - Ikon teratas adalah pengalih tema (matahari/bulan) yang langsung mengubah mode gelap/terang secara reaktif.
  - Ikon navigasi vertikal menyediakan shortcut cepat ke Dashboard, Riwayat, Detail, dan Pengaturan.

## 3. Asumsi Validasi & Interaksi Tautan Postingan
- Format tautan yang valid diuji menggunakan regex: `https?:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+`.
- Ketika tautan valid dimasukkan:
  - Muncul indikator valid (ikon centang hijau).
  - Mengklik tombol "Analisis" mengubah status tombol menjadi "Memproses…" dengan spinner selama 1.2 detik, lalu berpindah ke `/hasil/ANL_000076` disertai notifikasi toast hitam di kanan atas ("Analisis selesai").
- Jika pengguna memasukkan tautan dengan query `?error=unauthorized` atau shortcode `unauthorized_demo`, aplikasi menampilkan pesan galat inline sesuai design.md:
  > *"Postingan ini bukan milik akun yang terhubung. Hubungkan akun pemilik postingan, lalu coba lagi."*

## 4. Asumsi Visualisasi & Desain
- **Pola Arsir Negatif (Negative Hatched Pattern):** Menggunakan SVG pattern `<pattern id="hatch-accent">` dengan garis miring 45 derajat berulang (`repeating-linear-gradient` untuk HTML dan SVG pattern untuk Recharts) sesuai spesifikasi `design.md` bagian 7.2.
- **Kartu Akun Terhubung:** Ditampilkan dengan teknik horizontal scroll / over-hang terpotong di tepi kanan kartu induk untuk mempertahankan efek visual 90%+ dari referensi.
- **Koreksi Label:** Di halaman `/hasil/[id]`, pengguna dapat memilih koreksi label (Positif, Netral, Negatif) lewat dropdown mini. Perubahan ini mengubah state tabel secara instan (interaktif di sisi klien).
