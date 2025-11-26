# 1. Gambaran Umum Sistem

## 1.1. Nama Sistem

**Sistem Pemesanan Makanan Kantin Berbasis Website**
(Studi kasus: Kantin Fakultas Teknik Unsoed) 

## 1.2. Tujuan Pengembangan

* Mengganti proses pemesanan manual (kertas/nota) menjadi sistem web yang terintegrasi. 
* Mengurangi kesalahan pencatatan pesanan dan *double order*.
* Mempercepat layanan dan memudahkan rekap penjualan.
* Menyediakan data transaksi yang rapi untuk keperluan laporan dan analisis. 

## 1.3. Ruang Lingkup

Sistem mencakup:

* Pemesanan menu oleh pelanggan via web.
* Pengelolaan menu & kategori oleh admin.
* Pengelolaan data pelanggan (minimal: nama, nomor meja, keterangan). 
* Pencatatan order & transaksi pembayaran.
* Monitoring order dan laporan oleh admin.
* Pengelolaan pengeluaran. 

---

# 2. Stakeholder & Aktor

## 2.1. Stakeholder

* **Manajemen Kantin**: pemilik proses bisnis, butuh laporan dan kontrol.
* **Petugas / Admin Kantin**: input menu, konfirmasi pesanan, kelola transaksi.
* **Pelanggan (Mahasiswa/Dosen/Staff)**: melakukan pemesanan makanan.
* **Tim IT / Developer**: mengembangkan, memelihara, memonitor sistem.

## 2.2. Aktor Sistem

Mengacu pada use case di proposal: **Admin** dan **User (Pelanggan)**. 

### 2.2.1. Admin

* Login.
* Kelola jenis menu.
* Kelola menu makanan.
* Lihat & kelola data pelanggan.
* Lihat & konfirmasi pembayaran.
* Melihat laporan order dan pengeluaran.
* Logout.

### 2.2.2. User (Pelanggan)

* Mengakses halaman utama tanpa login.
* Melihat kategori & daftar menu. 
* Memilih menu & jumlah.
* Mengonfirmasi pesanan.
* Mengisi data diri (nama, nomor meja, keterangan). 
* Melihat status/orderselesai.

---

# 3. Kebutuhan Fungsional

## 3.1. Modul Pelanggan (Front Office)

1. **Lihat Halaman Utama**

   * Sistem menampilkan hero section + CTA untuk mulai memesan.
2. **Lihat Kategori Menu**

   * Menampilkan list kategori (makanan pembuka, utama, minuman, dll). 
3. **Lihat Daftar Menu per Kategori**

   * Menampilkan nama, harga, deskripsi singkat, stok/availability.
4. **Tambah Menu ke Keranjang**

   * User dapat memilih menu + jumlah.
   * Sistem menghitung subtotal & total.
5. **Kelola Keranjang**

   * Ubah jumlah item.
   * Hapus item.
6. **Konfirmasi Pesanan**

   * Menampilkan ringkasan order (detail item + total harga). 
7. **Input Data Pelanggan**

   * Nama, nomor meja, keterangan tambahan.
8. **Submit Pesanan**

   * Sistem membuat *Order* dan *Order Detail*.
   * Status awal: `MENUNGGU_KONFIRMASI` (atau sejenis).
9. **Lihat Halaman Order Selesai**

   * Notifikasi bahwa pesanan tercatat dan menunggu diproses. 

## 3.2. Modul Admin

1. **Login Admin**

   * Input username dan password.
   * Autentikasi & redirect ke dashboard. 
2. **Manajemen Kategori Menu**

   * CRUD kategori (nama, deskripsi, status).
3. **Manajemen Menu Makanan**

   * CRUD menu (nama, kategori, harga, stok, status). 
4. **Monitoring Pelanggan**

   * Melihat daftar pelanggan yang pernah order.
5. **Daftar Order**

   * Menampilkan list order terbaru.
   * Filter berdasarkan status (baru, diproses, selesai, dibatalkan).
   * Detail order: items, total, waktu, pelanggan, meja. 
6. **Konfirmasi Pembayaran**

   * Mengubah status transaksi (misal: `MENUNGGU`, `LUNAS`).
   * Opsional: input metode pembayaran & referensi transaksi.
7. **Laporan Order**

   * Rekap order per hari/bulan.
   * Total omzet, jumlah order.
8. **Input & Laporan Pengeluaran**

   * Input pengeluaran operasional (bahan, listrik, dll). 
   * Laporan pengeluaran per periode.
9. **Logout**

   * Mengakhiri sesi admin.

---

# 4. Kebutuhan Non-Fungsional

1. **Performance**

   * Halaman utama dan daftar menu harus termuat < 3 detik pada koneksi kampus normal.
   * Query basis data dioptimasi dengan indeks.
2. **Keamanan**

   * Password disimpan dengan hash.
   * Session & cookie aman, gunakan HTTPS di production.
   * Validasi input (server & client-side).
   * Role-based access control: Admin vs User.
3. **Reliability**

   * Backup basis data harian.
   * Logging untuk error & aktivitas penting (login, perubahan menu, update status).
4. **Usability**

   * UI responsif (mobile first).
   * Navigasi sederhana (Home → Kategori → Menu → Keranjang → Konfirmasi).
5. **Maintainability**

   * Struktur kode modular (layered architecture).
   * Dokumentasi API & database.
6. **Scalability (ringan)**

   * Desain database mendukung penambahan outlet/kantin lain di masa depan.

---

# 5. Desain Arsitektur Sistem

## 5.1. Arsitektur Logis

**3-layer architecture:**

1. **Presentation Layer**

   * Web UI (HTML/CSS/JS, bisa pakai framework: Tailwind+React).
2. **Application/Business Layer**

   * Mengelola logika pemesanan, validasi, perhitungan total, dll.
3. **Data Layer**

   * Basis data relasional yang mengimplementasikan ERD pada proposal. 

## 5.2. Rekomendasi Stack (Opsional)

* **Backend**: Laravel.
* **Frontend**: Tailwind+React.
* **Database**: MySQL.
* **Web Server**: Apache.
* **OS Server**: Linux (Ubuntu/Debian) untuk production.

---

# 6. Desain Basis Data (High-Level)

Mengacu pada ERD di proposal, disesuaikan menjadi entitas berikut: 

1. **Admin**

   * `id_admin` (PK)
   * `nama`
   * `username`
   * `password_hash`
   * `role`
   * `created_at`, `updated_at`

2. **User (Pelanggan)**

   * `id_user` (PK)
   * `nama`
   * `nomor_meja`
   * `keterangan`
   * `created_at`

3. **Kategori_Menu**

   * `id_kategori` (PK)
   * `nama_kategori`
   * `deskripsi`
   * `status` (aktif/nonaktif)
   * `created_at`, `updated_at`

4. **Menu**

   * `id_menu` (PK)
   * `id_kategori` (FK → Kategori_Menu)
   * `nama_menu`
   * `harga`
   * `stok`
   * `deskripsi`
   * `status` (tersedia/habis)
   * `created_at`, `updated_at`

5. **Order**

   * `id_order` (PK)
   * `id_user` (FK → User)
   * `waktu_order`
   * `total_harga`
   * `status_order` (MENUNGGU, DIPROSES, SELESAI, DIBATALKAN)
   * `catatan`
   * `created_at`, `updated_at`

6. **Order_Detail**

   * `id_order_detail` (PK)
   * `id_order` (FK → Order)
   * `id_menu` (FK → Menu)
   * `jumlah`
   * `harga_satuan`
   * `subtotal`

7. **Transaksi**

   * `id_transaksi` (PK)
   * `id_order` (FK → Order)
   * `id_user` (FK → User)
   * `jumlah_bayar`
   * `metode_pembayaran`
   * `status_pembayaran` (MENUNGGU, LUNAS, GAGAL)
   * `waktu_transaksi`

8. **Pengeluaran**

   * `id_pengeluaran` (PK)
   * `tanggal`
   * `kategori_pengeluaran`
   * `nominal`
   * `keterangan`

Relasi utama:

* Admin → memonitor User.
* User → banyak Order.
* Order → banyak Order_Detail.
* Order ↔ Transaksi (1-to-1 atau 1-to-many, tergantung desain; di paper relationalnya saling terkait). 

---

# 7. Desain Proses Bisnis (Alur Sistem)

Berbasis Activity Diagram & Flowchart pada proposal. 

## 7.1. Alur Pelanggan Memesan

1. User membuka website → halaman utama.
2. User pilih kategori → pilih menu → tambah ke keranjang.
3. User cek keranjang → bisa ubah/hapus item.
4. User klik “Konfirmasi Pesanan”.
5. User mengisi data (nama, meja, keterangan).
6. Server:

   * Validasi data.
   * Simpan `User` (jika modelnya per-order).
   * Simpan `Order` & `Order_Detail`.
   * Hitung total harga.
7. Tampilkan halaman “Order Selesai”.

## 7.2. Alur Admin Mengelola Sistem

1. Admin login.
2. Admin kelola kategori & menu makanan.
3. Admin buka daftar order:

   * Lihat order baru (`MENUNGGU`).
   * Ubah status order ke `DIPROSES` saat mulai dimasak.
   * Setelah siap, ubah status ke `SELESAI`.
4. Admin melakukan konfirmasi pembayaran:

   * Input nominal & metode.
   * Simpan `Transaksi` dan set `status_pembayaran = LUNAS`.
5. Admin melihat laporan order & pengeluaran.

---

# 8. Spesifikasi Antarmuka Utama

### 8.1. Frontend Pelanggan

1. **Halaman Utama**

   * Komponen: hero image, deskripsi singkat, tombol “Pesan Sekarang”.
2. **Halaman Kategori**

   * Grid kartu kategori (nama + icon/ilustrasi).
3. **Halaman Daftar Menu**

   * Card menu: nama, harga, kategori, stok, tombol +/− jumlah.
4. **Halaman Keranjang**

   * Tabel item, jumlah, harga, total.
   * Tombol “Ubah Pesanan”, “Lanjutkan”.
5. **Halaman Konfirmasi & Input Data**

   * Ringkasan order + form data pelanggan.
6. **Halaman Order Selesai**

   * Pesan sukses + informasi nomor order atau kode unik.

### 8.2. Frontend Admin

1. **Login Page**

   * Form username + password.
2. **Dashboard**

   * Ringkasan: total order hari ini, omzet, jumlah pesanan menunggu.
3. **Manajemen Kategori**

   * Tabel + form tambah/edit.
4. **Manajemen Menu**

   * Tabel menu, filter per kategori, tombol tambah/edit/hapus.
5. **Daftar Order**

   * Tabel: id_order, pelanggan, meja, status, total, aksi (lihat/ubah status).
6. **Daftar Transaksi**

   * Tabel transaksi dengan filter tanggal.
7. **Laporan**

   * Laporan order & pengeluaran dengan export (CSV/PDF) jika ingin dikembangkan.

---

# 9. API & Endpoint (Jika Menggunakan REST)

Contoh desain (bisa disesuaikan dengan framework):

* `GET /api/categories`
* `GET /api/menus?category_id=...`
* `POST /api/cart/checkout`
* `GET /api/orders/{id}`
* `POST /api/admin/login`
* `GET /api/admin/orders?status=MENUNGGU`
* `PATCH /api/admin/orders/{id}` (update status)
* `POST /api/admin/transactions`
* `GET /api/admin/reports/orders`
* `GET /api/admin/reports/expenses`

---

# 10. Rencana Implementasi & Production

## 10.1. Lingkungan Pengembangan

* Gunakan *git repo* (GitHub/GitLab).
* Branching simple: `main` (production), `dev` (development).
* Setup `.env` untuk konfigurasi (DB, APP_URL, dll).

## 10.2. Tahapan Implementasi (Waterfall Adaptation)

Mengacu pada model waterfall yang dipakai di proposal: observasi → analisis kebutuhan → desain → implementasi → evaluasi. 

Disesuaikan ke langkah praktis:

1. **Requirements Finalization**

   * Kunci semua kebutuhan fungsional & non-fungsional.
2. **System & DB Design**

   * Final ERD, skema tabel, dan diagram modul.
3. **UI/UX Design**

   * Mockup halaman utama user & admin.
4. **Development**

   * Build backend (auth, menu, order, transaksi).
   * Build frontend user & admin.
5. **Testing**

   * Unit test (service & repository).
   * Integration test (pemesanan lengkap).
   * UAT dengan pengguna kantin.
6. **Deployment**

   * Setup server (Linux, web server, database).
   * Jalankan migrasi database.
   * Konfigurasi domain & HTTPS.
7. **Monitoring & Maintenance**

   * Setup log error.
   * Backup database rutin.
   * Patch keamanan berkala.
