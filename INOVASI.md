# Inovasi Sistem E-Kantin (Project-PemWeb)

Dokumen ini merangkum berbagai inovasi dan fitur unggulan yang dikembangkan dalam sistem E-Kantin ini (Studi kasus: Kantin Fakultas Teknik Unsoed).

## 1. Konsep Multi-Tenant (Marketplace Kantin)

Berbeda dengan sistem pemesanan makanan sederhana yang hanya mengakomodasi satu entitas penjual, sistem E-Kantin ini dirancang sebagai platform **Marketplace**.

- **Dukungan Banyak Toko (Shops)**: Sistem mampu menampung banyak stan/kantin sekaligus dalam satu aplikasi.
- **Checkout Multi-Toko**: Pengguna dapat memesan menu dari berbagai stan berbeda dalam satu kali sesi belanja (keranjang terpadu), namun sistem secara cerdas memisahkan order tersebut di backend untuk masing-masing penjual.
- **Manajemen Terpisah**: Setiap pemilik stan memiliki panel masing-masing untuk mengelola menu dan pesanan mereka sendiri.

## 2. Integrasi Pembayaran Digital (Cashless)

Inovasi utama dalam modernisasi transaksi kantin adalah integrasi _payment gateway_.

- **Midtrans Integration**: Sistem terintegrasi penuh dengan Midtrans Snap API.
- **Metode Pembayaran Beragam**: Mendukung pembayaran via QRIS (GoPay, ShopeePay), Transfer Bank (Virtual Account), dan E-Wallet lainnya secara real-time.
- **Verifikasi Otomatis**: Penjual tidak perlu mengecek mutasi rekening manual. Sistem secara otomatis mengubah status pesanan menjadi "Dibayar" begitu Midtrans mengirimkan notifikasi sukses (Webhook).
- **Opsional Tunai**: Tetap mengakomodasi pembayaran tunai (Cash) untuk fleksibilitas maksimal, dengan pencatatan digital yang sama rapinya.

## 3. Fitur Keamanan & Kenyamanan Pengguna

- **Google OAuth Login**: Memudahkan mahasiswa/dosen untuk login menggunakan akun Google tanpa perlu mengingat password tambahan.
- **Proteksi Pembatalan Otomatis (Auto-Cancel)**: Sistem memiliki mekanisme _Scheduler_ untuk membatalkan pesanan yang belum dibayar dalam batas waktu tertentu (misal: 1 jam), dan secara otomatis mengembalikan stok menu. Ini mencegah "stok gantung" akibat pesanan iseng.

## 4. Efisiensi Operasional

- **Manajemen Stok Real-time**: Stok menu berkurang otomatis saat checkout, mencegah pesanan melebihi ketersediaan fisik.
- **Laporan Terpusat**: Admin kampus dapat memonitor performa seluruh kantin, sementara pemilik kantin dapat melihat omzet harian mereka sendiri.
- **Paperless**: Mengurangi penggunaan kertas nota fisik secara signifikan.

## 5. Arsitektur Modern

- **Single Page Application (SPA)**: Menggunakan teknologi Inertia.js (React) memberikan pengalaman pengguna yang sangat cepat, mulus, dan responsif tanpa _reload_ halaman berulang-ulang.
- **API-First Design**: Backend Laravel dirancang sebagai API, memungkinkan pengembangan aplikasi mobile (Android/iOS) di masa depan tanpa perlu merombak ulang _business logic_.

---

_Dibuat otomatis oleh AI Assistant berdasarkan analisis kode sumber & dokumentasi teknis._
