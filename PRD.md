# PRD — KantongSkansa (Website Manajemen Keuangan Siswa SMKN 1 Petang)

## 1. Latar Belakang

Proker KKN sosialisasi manajemen keuangan untuk siswa SMKN 1 Petang (Badung, Bali) tidak hanya menyampaikan materi (lihat `Cerdas-Kelola-Uang-SMK.pptx`), tapi juga membekali siswa dengan tools praktik langsung: website pencatatan & monitoring keuangan pribadi. Website ini dipakai live saat sesi (slide 9–10: studi kasus uang saku Rp500.000, catat ≥5 transaksi dalam 10–15 menit), dan dirancang tetap bisa dipakai siswa setelah KKN selesai.

**Constraint kunci:** dibangun solo, deploy gratis (Vercel + Neon), target siap **< 1 minggu**.

## 2. Tujuan Produk

1. Siswa bisa mendaftar akun, input saldo/pemasukan awal, dan mencatat transaksi pemasukan-pengeluaran dengan kategori.
2. Siswa bisa melihat ringkasan visual: saldo saat ini, breakdown 50/30/20 (Kebutuhan/Keinginan/Tabungan), realisasi vs target.
3. Website cukup sederhana untuk dipelajari dalam < 5 menit oleh siswa SMK yang baru pertama kali pakai app serupa.
4. Data & akun tetap tersedia setelah KKN selesai (persistent, bukan sekali pakai).


## 3. Target Pengguna & Konteks Pemakaian

- **Primary:** siswa SMKN 1 Petang, usia 16–18 tahun, kemungkinan besar akses dari HP (bukan laptop) baik saat sesi maupun setelahnya.
- **Konteks jaringan:** Petang adalah wilayah pegunungan Badung — asumsikan koneksi internet lambat/tidak stabil. Performa & mobile-first adalah kebutuhan fungsional, bukan nice-to-have.
- **Momen kritis:** sesi praktik 10–15 menit dengan studi kasus tunggal (uang saku Rp500.000/bulan, minimal 5 transaksi) — onboarding harus secepat mungkin (idealnya tanpa verifikasi email yang bisa nyangkut nunggu OTP).

## 4. User Flow Utama

```
Daftar (nama, email, password)
   → Login
   → Onboarding: input saldo awal / pemasukan bulanan (kategori default 50/30/20 sudah tersedia)
   → (opsional) Tambah/atur kategori custom & alokasi targetnya
   → Catat transaksi (tipe: pemasukan/pengeluaran, kategori, nominal, tanggal, catatan)
      → kalau kategori jadi overbudget, tampil warning singkat
   → Dashboard: saldo berjalan, grafik 50/30/20 realisasi vs target, grafik tren bulanan, badge overbudget per kategori
   → Riwayat transaksi: lihat/filter/edit/hapus, export CSV / cetak laporan
```

## 5. Fitur MVP (wajib, target < 1 minggu)

| # | Fitur | Detail |
|---|---|---|
| 1 | Auth (register/login) | Email + password, hash dengan bcrypt, session via cookie. Tanpa verifikasi email (biar tidak menghambat onboarding saat sesi). |
| 2 | Saldo awal / pemasukan | Input sekali di awal (bisa diedit nanti), jadi basis perhitungan alokasi 50/30/20. |
| 3 | Catat transaksi | Tambah transaksi: tipe (masuk/keluar), kategori (Kebutuhan/Keinginan/Tabungan), nominal, tanggal, catatan opsional. |
| 4 | Riwayat transaksi | List transaksi, filter per kategori/tanggal, edit & hapus. |
| 5 | Dashboard ringkasan | Saldo saat ini, total pemasukan/pengeluaran, breakdown 50/30/20 (chart donat) realisasi vs target. |
| 6 | Mobile responsive | Wajib — akses utama dari HP. |
| 7 | Kategori custom | User bisa tambah kategori sendiri di luar 3 default (Kebutuhan/Keinginan/Tabungan), dengan nama & alokasi target sendiri (% dari pemasukan atau nominal tetap). |
| 8 | Logika overbudget | Realisasi tiap kategori (termasuk custom) dibandingkan ke target alokasinya. Kalau realisasi > target: badge/warning merah di dashboard & di kartu kategori, plus notifikasi singkat saat transaksi baru yang menyebabkan kategori itu overbudget. Terpisah, ada juga pengecekan overall: total pengeluaran > total pemasukan → warning saldo minus. |
| 9 | Grafik tren bulanan | Line chart pemasukan vs pengeluaran per bulan (Recharts); tampil begitu ada data ≥2 bulan, sebelum itu tampilkan state kosong yang jelas. |
| 10 | Export / cetak laporan | Export riwayat transaksi + ringkasan ke CSV. "Cetak" laporan pakai halaman print-friendly (browser print/PDF), bukan generator PDF terpisah — lebih cepat dibangun dan cukup untuk kebutuhan siswa. |

## 6. Fitur Lanjutan (v1.1+, di luar scope minggu ini)

- SMART goal tracker (target tabungan + progress bar, selaras materi slide 6)
- Tips edukasi in-app terintegrasi materi PPT (mini microlearning)

## 7. Kebutuhan Non-Fungsional

- **Performa:** minim JS di client, prioritaskan server components; asumsikan koneksi lambat di lokasi KKN.
- **Keamanan:** password di-hash (bcrypt), session httpOnly cookie, isolasi data antar user (tidak ada user yang bisa lihat data user lain).
- **Aksesibilitas:** kontras cukup, ukuran tap target nyaman di HP, font ≥16px.
- **Reliabilitas saat demo:** siapkan akun demo pre-filled sebagai cadangan kalau live registrasi gagal karena internet.

## 8. Tech Stack (rekomendasi)

Dipilih untuk kecepatan eksekusi solo dalam waktu sempit + selaras keinginan hosting gratis (Vercel + Neon):

- **Framework:** Next.js (App Router) + TypeScript
- **Styling/UI:** Tailwind CSS + shadcn/ui (komponen form/card/dialog siap pakai → hemat waktu)
- **Database:** Neon (Postgres serverless, free tier)
- **ORM:** Drizzle ORM (ringan, cocok dengan Neon serverless driver, migrasi cepat)
- **Auth:** Auth.js (NextAuth) Credentials provider — hindari reinvent session/CSRF handling
- **Form & validasi:** react-hook-form + zod
- **Chart:** Recharts
- **Mutasi data:** Next.js Server Actions (hindari bikin layer API terpisah, hemat waktu)
- **Hosting:** Vercel (auto-deploy dari git push)

## 9. Skema Data (ringkas)

```
users
  id, name, email (unique), password_hash,
  monthly_income,  -- basis hitung alokasi 50/30/20
  created_at

categories
  id, user_id (FK), name, is_default (bool),
  budget_percent (nullable) | budget_amount (nullable),  -- salah satu diisi
  created_at
  -- seed otomatis saat register: Kebutuhan 50%, Keinginan 30%, Tabungan 20%

transactions
  id, user_id (FK), category_id (FK → categories),
  type (income|expense), amount, note, date, created_at
```

**Catatan overbudget:** dihitung on-the-fly (bukan kolom tersimpan) — `SUM(expense transactions per category_id per periode)` dibandingkan ke `budget_percent * monthly_income` atau `budget_amount`. Kategori custom tanpa target diisi dianggap tidak dicek overbudget (hanya tampil di breakdown).

## 10. Rencana Eksekusi

Scope MVP baru lebih besar dari kapasitas 6 hari semula. Kalau deadline kamu tetap ketat di < 1 minggu, rencana di bawah butuh dipadatkan atau di-cut sesuai urutan prioritas di akhir bagian ini.

| Hari | Fokus |
|---|---|
| 1 | Setup Next.js + Tailwind + shadcn, koneksi Neon, schema + migrasi (users, categories, transactions), auth register/login, seed kategori default |
| 2 | CRUD transaksi + input saldo awal/pemasukan + UI tambah/edit kategori custom |
| 3 | Dashboard: chart donat 50/30/20, ringkasan saldo, logika & badge overbudget |
| 4 | Riwayat transaksi + filter/edit/hapus, grafik tren bulanan |
| 5 | Export CSV + halaman cetak laporan, polish responsive/mobile |
| 6 | Testing end-to-end pakai skenario slide 10 (uang saku 500rb, 5 transaksi), seed akun demo, deploy Vercel |
| 7 (buffer, kalau ada) | Bug fixing, siapkan akun demo cadangan, gladi bersih integrasi dengan sesi presentasi |

**Urutan yang pertama dikorbankan kalau waktu benar-benar mepet** (inti praktik — auth, catat transaksi, dashboard 50/30/20, overbudget — tidak boleh dikorbankan):
1. Cetak PDF → cukup export CSV dulu
2. Grafik tren bulanan → tampilkan setelah fitur inti selesai, atau skip untuk sesi ini
3. UI edit kategori custom → batasi ke 1 form sederhana (nama + target %), tanpa edit/hapus dulu
4. Chart Recharts untuk donat 50/30/20 → turunkan ke progress bar CSS kalau hari 3 belum kelar, upgrade belakangan kalau sempat

## 11. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Internet lambat/putus di lokasi sesi | Siapkan akun demo pre-filled sebagai fallback; optimalkan performa (server components, minim JS) |
| Siswa baru pertama kali pakai app serupa | UI seminimal mungkin, onboarding tanpa verifikasi email, form pendek |
| Waktu build < 1 minggu | Scope MVP ketat (lihat §5), fitur v1.1 ditunda tanpa kompromi ke fungsi inti |
| Data keuangan siswa (walau nominal kecil) | Password di-hash, isolasi data per user, HTTPS otomatis dari Vercel |

## 12. Metrik Keberhasilan

- ≥80% siswa berhasil daftar akun & input ≥5 transaksi dalam sesi praktik 10–15 menit.
- Website tetap bisa diakses & dipakai siswa beberapa minggu setelah sesi (indikasi keberlanjutan pasca-KKN).
