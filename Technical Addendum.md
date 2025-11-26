
---

# Technical Addendum: Multi-Vendor Support (Sistem E-Kantin Food Court)

## 1. Perubahan Struktur Database (Schema Update)
Kita perlu memecah kepemilikan data agar setiap menu dan pesanan terhubung ke "Lapak" yang spesifik, bukan ke satu admin pusat saja.

### A. Tabel Baru: `shops`
Tabel ini menampung profil setiap lapak yang ada di kantin.
* **Columns:**
    * `id` (PK)
    * `name` (e.g., "Warung Bu Tini", "Pojok Jus")
    * `owner_user_id` (FK ke table Users)
    * `description`
    * `image_logo`
    * `status` (Enum: 'open', 'closed') -> *Fitur penting agar penjual bisa tutup lapak sendiri jika stok habis/libur.*

### B. Modifikasi Tabel: `products`
Menu makanan tidak lagi "milik admin", tapi "milik lapak".
* **Add Column:** `shop_id` (FK ke table Shops).
* **Logic:** Saat menampilkan menu, query harus bisa memfilter: `SELECT * FROM products WHERE shop_id = X`.

### C. Modifikasi Tabel: `orders` & `order_items` (Split Order Logic)
Ini bagian paling *tricky*. Jika mahasiswa memesan **Nasi Goreng (Lapak A)** dan **Es Teh (Lapak B)** dalam satu kali checkout, sistem tidak boleh menggabungkannya dalam satu Order ID yang sama, karena Lapak A tidak boleh melihat orderan milik Lapak B.

* **Solusi:** Terapkan **"Parent-Child Order"** atau **"Split Order"**.
    * Saat user klik "Checkout", sistem men-generate 1 **Payment Transaction** (Total Rp 20.000).
    * Sistem otomatis memecah menjadi 2 **Order ID**:
        * `Order #101`: Nasi Goreng -> Masuk ke Dashboard Lapak A.
        * `Order #102`: Es Teh -> Masuk ke Dashboard Lapak B.
* **Table Update:** Tabel `orders` harus punya kolom `shop_id`.

## 2. Penambahan Level Akses (User Roles)
[cite_start]Sistem sekarang membutuhkan hirarki user yang lebih kompleks dibanding proposal awal yang hanya "Admin" dan "User"[cite: 94].

1.  **Super Admin (Pihak Kampus ISB):**
    * Bisa membuat/menghapus akun Lapak.
    * Melihat total omzet seluruh kantin.
    * Mengatur komisi (jika ada bagi hasil).
2.  **Tenant Admin (Pemilik Lapak):**
    * Hanya bisa CRUD (Create, Read, Update, Delete) menu milik lapaknya sendiri.
    * Hanya menerima notifikasi orderan untuk lapaknya sendiri.
    * Mengatur status Buka/Tutup lapak.
3.  **Customer (Mahasiswa):**
    * Bisa melihat daftar lapak.
    * Bisa filter makanan berdasarkan lapak.

## 3. Penyesuaian Alur Sistem (Flowchart)

### A. Halaman Utama (Homepage)
[cite_start]Sebelum menampilkan daftar makanan[cite: 184], user harus disuguhi pilihan:
* **View by Lapak:** User memilih "Warung A", lalu baru melihat menu Warung A.
* **View by Category:** User memilih "Minuman", sistem menampilkan semua minuman dari semua lapak (dicampur).

### B. Keranjang Belanja (Cart)
Di halaman keranjang, item harus dikelompokkan berdasarkan lapak (Grouping).
* *UI Mockup Idea:*
    * **Lapak A**
        * Nasi Goreng (1x)
    * **Lapak B**
        * Es Teh (1x)
    * **Total Bayar:** (Gabungan keduanya)

## 4. Fitur Keuangan (Financial)
[cite_start]Karena ada banyak penjual, fitur "Laporan Pengeluaran" [cite: 146] dan Laporan Pendapatan di proposal harus lebih spesifik:
* **Sistem Saldo/Withdrawal:** Uang pembayaran (jika via QRIS/Transfer) masuk ke rekening Kampus dulu. Sistem harus mencatat "Utang Kampus ke Lapak".
* **Laporan Per Lapak:** Super Admin butuh fitur "Rekap Harian" untuk tahu berapa uang tunai yang harus disetor ke masing-masing lapak jika sistem pembayarannya terpusat di satu kasir.

---

### Saran Implementasi untuk Programmer:
Untuk fase awal (*MVP*), saya sarankan gunakan logika **"Checkout Per Lapak"** saja dulu untuk memudahkan kodingan backend:
> *"Maaf, Anda tidak bisa memesan dari 2 lapak berbeda sekaligus. Silakan selesaikan pembayaran Lapak A dulu, baru pesan di Lapak B."*

Ini jauh lebih mudah dikoding (seperti ShopeeFood/GoFood) daripada membuat sistem *Split Order* yang kompleks.

**Next Step:**
Apakah kamu ingin saya buatkan **Relasi Tabel (ERD Baru)** yang menggambarkan hubungan antara `User` -> `Shops` -> `Products` ini?