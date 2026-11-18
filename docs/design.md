# design.md – Nara (Frontend Design System)

Spesifikasi desain antarmuka Nara, mengikuti **±90%** referensi dashboard yang diberikan (gaya "Finexy": kartu putih membulat, aksen oranye, navigasi pil, sidebar ikon). Sisanya (±10%) adalah penyesuaian yang memang dibutuhkan produk.

---

## 1. Prinsip Desain
1. **Tenang dan lapang.** Latar abu sangat terang, kartu putih, banyak ruang kosong.
2. **Satu aksen.** Oranye dipakai hemat: kartu sorotan, seri data penting, tombol sekunder, progres.
3. **Hitam sebagai penegas.** Elemen aktif dan aksi utama berupa pil hitam.
4. **Bentuk membulat konsisten.** Cangkang 28, kartu 20, panel dalam 16, tombol dan chip berbentuk pil penuh.
5. **Angka besar, label kecil.** Angka utama berukuran besar dengan bobot medium (500).
6. **Status lewat titik berwarna dan chip lembut.**

---

## 2. Design Tokens

### 2.1 Warna
- `--bg-page`: `#EBEBEB` (Dark: `#0F0F0E`)
- `--bg-shell`: `#F5F5F5` (Dark: `#161615`)
- `--surface`: `#FFFFFF` (Dark: `#1F1F1D`)
- `--surface-muted`: `#F5F5F5` (Dark: `#2A2A27`)
- `--surface-row-selected`: `#F2F2F2` (Dark: `#242421`)
- `--ink`: `#1B1B19` (Dark: `#F5F5F3`)
- `--ink-soft`: `#6B6B6B` (Dark: `#A8A8A4`)
- `--ink-faint`: `#A3A3A0`
- `--line`: `#E6E6E3` (Dark: `#34342F`)
- `--accent`: `#EE5A2A`
- `--accent-light`: `#FF7A45`
- `--accent-deep`: `#D94A1A`
- `--accent-gradient`: `linear-gradient(160deg, #FF7A45 0%, #EE5A2A 100%)`
- `--success`: `#2FA84F`, `--success-bg`: `#E3F5E6`
- `--danger`: `#E5483A`, `--danger-bg`: `#FDE8E5`
- `--warning`: `#F2B01E`

### 2.2 Radius
- Shell: 28px
- Card: 20px
- Panel: 16px
- Input & Chip: 999px (pil)
- Checkbox: 4px

### 2.3 Tipografi
- Inter, 400 (regular), 500 (medium/titles/numbers), 600 (semi-bold)
- Sentence case, hindari uppercase berlebihan.
