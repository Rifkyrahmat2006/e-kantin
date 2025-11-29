import { ArrowLeft, BookOpen, Search, Coffee, ShoppingBag, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function UserGuide() {
    const navigate = useNavigate();

    const guides = [
        {
            title: "Cara Memesan Makanan",
            icon: <ShoppingBag className="h-6 w-6 text-blue-600" />,
            steps: [
                "Buka halaman Home atau Kantin.",
                "Pilih menu yang ingin dipesan.",
                "Klik tombol '+' untuk menambahkan ke keranjang.",
                "Buka keranjang belanja.",
                "Klik 'Checkout' dan pilih metode pembayaran.",
                "Tunggu pesanan dikonfirmasi oleh kantin."
            ]
        },
        {
            title: "Cara Mencari Menu",
            icon: <Search className="h-6 w-6 text-purple-600" />,
            steps: [
                "Gunakan kolom pencarian di bagian atas halaman Home.",
                "Ketik nama makanan atau nama kantin.",
                "Hasil pencarian akan muncul secara otomatis.",
                "Klik menu untuk melihat detailnya."
            ]
        },
        {
            title: "Mengelola Profil",
            icon: <User className="h-6 w-6 text-green-600" />,
            steps: [
                "Masuk ke halaman Profil.",
                "Klik 'Pengaturan Akun' untuk mengubah data diri.",
                "Anda dapat mengubah nama, email, dan foto profil.",
                "Klik 'Simpan' untuk menyimpan perubahan."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors mr-2"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 flex items-center">
                        <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                        Panduan Pengguna
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg">
                    <h2 className="text-xl font-bold mb-2">Selamat Datang di E-Kantin!</h2>
                    <p className="text-blue-100">
                        Berikut adalah panduan singkat untuk membantu Anda menggunakan aplikasi E-Kantin dengan mudah.
                    </p>
                </div>

                <div className="space-y-4">
                    {guides.map((guide, index) => (
                        <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center mb-4">
                                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center mr-4">
                                    {guide.icon}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{guide.title}</h3>
                            </div>
                            <ol className="space-y-3 ml-3">
                                {guide.steps.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex items-start text-gray-600 text-sm">
                                        <span className="flex-shrink-0 h-5 w-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                            {stepIndex + 1}
                                        </span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-8">
                    <p className="text-gray-500 text-sm mb-4">Masih butuh bantuan?</p>
                    <a
                        href="mailto:support@ekantin.com"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                    >
                        Hubungi Bantuan
                    </a>
                </div>
            </div>
        </div>
    );
}
