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

## 7. Asumsi dan Keputusan Teknis – Fase 2A (Backend FastAPI & PostgreSQL)
- **Lingkup Arsitektur:** Implementasi backend inti menggunakan FastAPI, PostgreSQL (via Docker Compose / lokal port 5432), SQLAlchemy 2.x, Alembic, psycopg v3, dan Argon2id untuk hashing kata sandi.
- **Urutan Fase Baru:**
  1. Fase 1: Frontend Foundation & Mock Data (selesai).
  2. Fase 2A: Backend Core, Auth, & Impor Berkas (selesai).
  3. Fase 3: Pipeline NLP (Preprocessing, IndoBERT/Rule-based inference, sentimen).
  4. Fase 4: Integrasi Frontend & Backend, Ekspor Laporan PDF/CSV.
  5. Fase 5: Integrasi Instagram Graph API & Meta OAuth.
  6. Fase 6: Pengujian komprehensif, optimasi performa, & deployment.
- **Model Analisis Ganda (`source_type`):**
  - Setiap rekaman analisis memiliki atribut `source_type` bernilai `file_import` (saat ini) atau `instagram_link` (Fase 5). Kedua jalur masukan menghasilkan format komentar yang identik pada tabel `comments`.
- **Manajemen Sesi & Keamanan:**
  - Autentikasi menggunakan cookie `nara_session` berisi token JWT (HS256) dengan masa aktif 8 jam (`httpOnly: True`, `samesite="lax"`, `secure` di environment produksi).
  - Endpoint `POST /api/auth/login` mengembalikan pesan galat 401 identik (*"Email atau kata sandi salah."*) baik untuk kasus email tidak terdaftar maupun kata sandi salah guna mencegah *user enumeration attack*.
  - Dilengkapi *in-memory rate limiter*: 5 kali percobaan gagal berturut-turut untuk kombinasi email + alamat IP memicu status HTTP 429 selama 30 detik.
  - Endpoint `POST /api/auth/logout` menghapus cookie sesi dengan atribut identik dan menyertakan header `Cache-Control: no-store`.
  - Endpoint publik hanya: `GET /api/health`, `GET /api/imports/template`, `POST /api/auth/register`, dan `POST /api/auth/login`. Seluruh endpoint analisis lainnya memerlukan dependency `get_current_user`.
- **Isolasi Akses Multi-Tenant:**
  - Seluruh query daftar, detail, komentar, dan penghapusan analisis difilter secara ketat berdasarkan `user_id`.
  - Akses terhadap ID analisis milik pengguna lain menghasilkan status HTTP 404 (*"Analisis tidak ditemukan atau Anda tidak memiliki akses."*) guna mencegah *information disclosure* (tidak menggunakan 403).
- **Aturan Pemrosesan Berkas Komentar:**
  - Hanya berkas dengan ekstensi `.csv` dan `.xlsx` yang diizinkan (maksimal 5 MB dan 10.000 baris).
  - Kolom `comment_text` wajib ada dan tidak boleh kosong; baris kosong diabaikan.
  - Teks komentar dipotong maksimal 2.000 karakter (`MAX_TEXT_LENGTH`).
  - Label sentimen dinormalisasi tanpa membedakan huruf besar/kecil (`positif`, `netral`, `negatif`). Nilai di luar ketiga label tersebut diabaikan (dijadikan `None`) dan dihitung pada `ignored_labels_count`.
  - Parsing tanggal/waktu bersifat toleran (*tolerant parsing*); nilai yang tidak dapat diparse disimpan sebagai `None`.
  - Nilai jumlah like non-numerik dinormalisasi menjadi `0`.
- **Mitigasi Formula Injection:**
  - Untuk ekspor CSV di fase berikutnya, sel yang diawali karakter formula (`=`, `+`, `-`, `@`) wajib di-escape tanda kutip tunggal untuk mencegah *CSV Injection* di aplikasi spreadsheet.
- **Hal yang Belum Dikerjakan (Di Luar Lingkup Fase 2A):**
  - Penyambungan frontend Next.js dengan API backend (dikerjakan pada Fase 4).
  - Integrasi model Machine Learning / IndoBERT untuk inferensi sentimen otomatis saat file tidak berlabel (Fase 3).
  - Integrasi webhook & OAuth Instagram Graph API (Fase 5).
  - Verifikasi email dan alur lupa kata sandi.
