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


## 5. Asumsi Fitur Impor Berkas (CSV / XLSX)
- **Jalur Masukan Ganda:** Pada baris judul dashboard, disediakan komponen `InputModeTabs` dengan dua pil (`Tautan Instagram` dan `Impor file`). Tab aktif berupa pil hitam pekat.
- **Validasi Berkas:**
  - Format yang diterima hanya `.csv` dan `.xlsx` (ekstensi dan MIME). File di luar ini memicu pesan galat inline dalam bahasa Indonesia: *"Format berkas tidak didukung. Harap unggah file berformat .CSV atau .XLSX."*
  - Batas ukuran berkas maksimal 5 MB. Jika melampaui, muncul galat: *"Ukuran berkas melebihi batas 5 MB (ukuran berkas: X MB). Harap perkecil berkas."*
  - Batas data maksimal 10.000 baris. Jika melampaui, muncul galat: *"Jumlah baris data melebihi batas 10.000 baris (total terdeteksi: X baris). Harap bagi berkas menjadi lebih kecil."*
- **Parsing dan Penyimpanan Sisi Klien:**
  - File CSV diparsing secara penuh di browser menggunakan `papaparse` dengan `header: true` dan `skipEmptyLines: true`. Pratinjau tabel pada halaman `/impor` membatasi tampilan pada 10 baris pertama (slice) dengan informasi jumlah baris nyata (misal: *"160 baris terbaca. Menampilkan 10 pertama."*).
  - Seluruh baris dataset hasil parsing disimpan dalam state aplikasi terpusat (`AnalysisContext`) dan dicadangkan ke `sessionStorage` (`nara_imported_analysis`) dengan pembacaan asinkron/aman setelah mount (`useEffect`) agar tidak memicu *hydration mismatch*.
  - File XLSX menampilkan pratinjau dummy dengan keterangan *"Pratinjau XLSX akan tersedia setelah backend aktif"*.
- **Pemetaan Kolom & Penentuan Sentimen:**
  - Kolom `comment_text` bersifat Wajib (*Required*). Tombol "Mulai Analisis Sentimen" tidak aktif (*disabled*) sebelum kolom ini dipilih.
  - Kolom `timestamp`, `username`, `like_count`, `post_title`, dan `label` bersifat Opsional.
  - Jika kolom `label` dipetakan dan berisi nilai `positif`/`netral`/`negatif` (tidak peka huruf besar-kecil), nilai tersebut digunakan langsung sebagai sentimen komentar.
  - Jika kolom `label` tidak tersedia atau kosong, sentimen disimulasikan sementara menggunakan aturan heuristik daftar kata kunci positif dan negatif bahasa Indonesia (*rule-based*), serta menampilkan chip/banner peringatan *"Simulasi: sentimen belum dihitung model"* di halaman hasil sampai backend model NLP Fase 3 tersedia.
- **Agregasi Dinamis & Tampilan Hasil:**
  - Metrik dihitung secara reaktif dari seluruh data menggunakan `useMemo`: total komentar, distribusi positif/netral/negatif (jumlah & persen), tren harian (disembunyikan otomatis jika tidak ada timestamp valid), 10 kata kunci teratas (mengabaikan stopword bahasa Indonesia), dan perbandingan per `post_title` jika tersedia di berkas.
  - Tabel komentar di halaman `/hasil/[id]` mendukung pagination sisi klien (10, 25, 50 baris per halaman, default 10, teks *"Menampilkan 1–10 dari X"*), pencarian teks, filter sentimen, dan sorting (terbaru, terlama, suka terbanyak).
  - Jika halaman hasil impor diakses tanpa data atau direfresh pada sesi baru yang kosong, aplikasi menampilkan status kosong terarah: *"Data analisis tidak ditemukan. Unggah ulang file."* dengan tombol CTA kembali ke `/impor`.
- **Pembeda Sumber Data:** Ditambahkan tipe `SourceType = "Instagram" | "File"` serta komponen `SourceChip` pada tabel riwayat analisis, mini-kartu postingan ringkasan, dan header hasil analisis detail.
- **Template Berkas:** Template contoh disediakan di `/templates/nara-template.csv` berisi 8 baris komentar realistis berbahasa Indonesia.


## 6. Asumsi Autentikasi dan Halaman Login Sementara (Fase 1)
- **Sifat Sementara:** Alur autentikasi ini merupakan implementasi sementara (*dummy mock*) untuk memvalidasi alur navigasi dan hak akses di sisi frontend pada Fase 1. Pada Fase 2, autentikasi akan diganti sepenuhnya oleh service FastAPI, hashing kata sandi aman (bcrypt/argon2), database pengguna, dan refresh/access token JWT Meta OAuth.
- **Penyimpanan Kredensial:** Kredensial demo disimpan secara aman di `frontend/.env.local` (diabaikan oleh Git via `.gitignore`) dengan variabel `DEMO_EMAIL`, `DEMO_PASSWORD`, dan `AUTH_SECRET`. Kredensial tidak pernah di-hardcode ke bundel client maupun variabel `NEXT_PUBLIC_*`.
- **Validasi Sisi Server (Route Handler):** Pengecekan email dan kata sandi diproses di server melalui endpoint `POST /api/auth/login`. Jika gagal, server mengembalikan status HTTP 401 dengan pesan generik *"Email atau kata sandi salah."*
- **Sesi Bertanda Tangan HMAC-SHA256:**
  - Token sesi dibuat menggunakan Web Crypto API bawaan (`crypto.subtle`) dengan algoritma HMAC-SHA256 bertanda tangan `payload.signature`.
  - Disimpan dalam cookie `nara_session` bertipe `httpOnly: true`, `sameSite: "lax"`, `secure` (production), dengan masa aktif 8 jam.
  - Nilai cookie bukan kredensial mentah pengguna.
- **Proteksi Rute via Middleware (`src/middleware.ts`):**
  - Pengguna tanpa sesi valid yang mengakses rute manapun di luar `/login` akan langsung diarahkan (*server-side redirect*) ke `/login` tanpa menampilkan dashboard terlebih dahulu.
  - Pengguna yang sudah memiliki sesi valid yang membuka `/login` akan dialihkan ke `/`.
  - Semua halaman terproteksi menyertakan header `Cache-Control: no-store, no-cache, must-revalidate` untuk mencegah browser menampilkan halaman dashboard dari memori cache saat tombol Back ditekan setelah logout.
- **Struktur Route Group Next.js:** Menggunakan route group `(app)` untuk halaman ber-AppShell dan `(auth)` untuk halaman `/login` dengan layout polos, menjaga kestabilan URL publik (`/`, `/login`, `/hasil/[id]`, `/hubungkan`, `/impor`).

- **Mekanisme Logout Terpusat:**
  - Fungsi logout dikonsolidasikan ke dalam hook `useLogout` yang digunakan seragam oleh seluruh tombol keluar (`SideRail`, dropdown `TopBar`, dan `BottomTabBar`).
  - Endpoint `POST /api/auth/logout` menghapus cookie sesi secara definitif dengan menyetel `Set-Cookie` bernilai kosong, `maxAge: 0`, `expires: new Date(0)`, serta atribut identik saat pembuatan (`path: "/"`, `sameSite: "lax"`, `httpOnly: true`, `secure`).
  - Navigasi logout di sisi client memakai `window.location.assign("/login")` (bukan client-side soft router push) guna membersihkan seluruh router cache client dan memori state React.
  - Penanda notifikasi toast disimpan di `sessionStorage` sebelum navigasi dan dibaca serta dihapus saat halaman `/login` selesai dimuat (bebas dari hydration mismatch).
