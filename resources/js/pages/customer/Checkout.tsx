import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';
import { ChevronLeft, MapPin, FileText, Receipt } from 'lucide-react';

export default function Checkout() {
    const { items, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [tableNumber, setTableNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            let shopId = items.length > 0 ? items[0].shop_id : null;

            if (!shopId && items.length > 0) {
                try {
                    const menuRes = await api.get(`/menus/${items[0].id}`);
                    shopId = menuRes.data.menu.shop_id;
                } catch (e) {
                    console.error("Failed to fetch shop details", e);
                }
            }

            if (!shopId) {
                setError("Unable to determine shop for these items. Please remove them and try again.");
                setIsLoading(false);
                return;
            }

            await api.post('/orders', {
                shop_id: shopId,
                items: items.map(item => ({
                    menu_id: item.id,
                    quantity: item.quantity
                })),
                table_number: tableNumber,
                notes: notes
            });

            clearCart();
            navigate('/order-success'); // Make sure this route exists or redirect to history
        } catch (err: any) {
            console.error('Checkout error:', err);
            setError('Failed to place order. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (items.length === 0) {
        navigate('/menu');
        return null;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-32 md:pb-12">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white px-4 py-3 shadow-sm flex items-center max-w-7xl mx-auto w-full md:rounded-b-xl md:mt-4 md:px-6">
                <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100">
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-md px-4 py-6 space-y-6 md:max-w-7xl md:grid md:grid-cols-3 md:gap-8 md:space-y-0">
                {/* Left Column: Inputs */}
                <div className="md:col-span-2 space-y-6">
                    {/* Table Number Section */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                <MapPin className="h-4 w-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Lokasi Pengantaran</h2>
                        </div>
                        <div>
                            <label htmlFor="table-number" className="block text-sm font-medium text-gray-700 mb-1">
                                Nomor Meja
                            </label>
                            <input
                                type="text"
                                id="table-number"
                                required
                                value={tableNumber}
                                onChange={(e) => setTableNumber(e.target.value)}
                                placeholder="Contoh: 12"
                                className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3"
                            />
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                                <FileText className="h-4 w-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Catatan Pesanan</h2>
                        </div>
                        <textarea
                            id="notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Contoh: Jangan terlalu pedas, es dipisah..."
                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Right Column: Summary & Action */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-24">
                        <div className="flex items-center mb-4">
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-3">
                                <Receipt className="h-4 w-4" />
                            </div>
                            <h2 className="text-base font-bold text-gray-900">Ringkasan Pesanan</h2>
                        </div>
                        <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                            {items.map((item) => (
                                <li key={item.id} className="flex py-3">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex flex-1 flex-col justify-center">
                                        <div className="flex justify-between text-sm font-medium text-gray-900">
                                            <h3>{item.name}</h3>
                                            <p>{formatRupiah(item.price * item.quantity)}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.price)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-blue-600 text-lg">{formatRupiah(totalPrice)}</span>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Desktop Submit Button (Inside Card) */}
                        <div className="hidden md:block mt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                            >
                                {isLoading ? 'Memproses...' : `Bayar ${formatRupiah(totalPrice)}`}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 max-w-md mx-auto mb-0 md:hidden">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                    >
                        {isLoading ? 'Memproses...' : `Bayar ${formatRupiah(totalPrice)}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
