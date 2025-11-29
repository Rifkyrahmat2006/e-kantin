import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem from '../../components/CartItem';
import { formatRupiah } from '../../utils/formatRupiah';
import { ArrowRight, ShoppingBag, ChevronLeft } from 'lucide-react';

export default function Cart() {
    const { items, totalPrice } = useCart();
    const navigate = useNavigate();

    if (items.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                    <ShoppingBag className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Keranjang Kosong</h2>
                <p className="mt-2 text-center text-gray-500">Sepertinya Anda belum memesan apapun.</p>
                <Link
                    to="/menu"
                    className="mt-8 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                    Mulai Pesan
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-32 md:pb-8">
            <div className="sticky top-0 z-40 bg-white px-4 py-3 shadow-sm flex items-center max-w-7xl mx-auto w-full md:rounded-b-xl md:mt-4 md:px-6">
                <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Keranjang Saya</h1>
            </div>

            <div className="mx-auto max-w-2xl px-4 py-6 md:max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <ul role="list" className="divide-y divide-gray-200">
                        {items.map((item) => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </ul>
                </div>
            </div>

            {/* Fixed Bottom Summary */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 max-w-md mx-auto mb-[4.5rem] pb-safe md:mb-0 md:static md:max-w-4xl md:rounded-2xl md:shadow-sm md:border-none md:mt-4">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-medium text-gray-600">Total Pembayaran</span>
                    <span className="text-xl font-bold text-gray-900">{formatRupiah(totalPrice)}</span>
                </div>
                <Link
                    to="/checkout"
                    className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] transition-all"
                >
                    Checkout
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
        </div>
    );
}
