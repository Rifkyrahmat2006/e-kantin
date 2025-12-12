import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';
import { ChevronLeft, MapPin, FileText, Receipt, ShoppingBag, ChevronDown, Truck, CreditCard, Banknote, CheckCircle } from 'lucide-react';

// Delivery locations
const DELIVERY_LOCATIONS = [
    { id: 'gedung-a', name: 'Gedung A' },
    { id: 'gedung-b', name: 'Gedung B' },
    { id: 'gedung-c', name: 'Gedung C' },
    { id: 'gedung-d', name: 'Gedung D' },
    { id: 'gedung-e', name: 'Gedung E' },
    { id: 'gedung-f', name: 'Gedung F' },
    { id: 'sekre-ukm', name: 'Sekre UKM' },
    { id: 'gazebo-1', name: 'Gazebo 1' },
    { id: 'gazebo-2', name: 'Gazebo 2' },
    { id: 'gazebo-3', name: 'Gazebo 3' },
    { id: 'gazebo-4', name: 'Gazebo 4' },
    { id: 'gazebo-5', name: 'Gazebo 5' },
];

// Payment methods
type PaymentMethod = 'MIDTRANS' | 'CASH';

export default function Checkout() {
    const { items, totalPrice, getSelectedItems, selectedTotalPrice, selectedItemsCount, clearCart } = useCart();
    const navigate = useNavigate();
    const [deliveryLocation, setDeliveryLocation] = useState('');
    const [deliveryDescription, setDeliveryDescription] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MIDTRANS');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Use selected items for checkout
    const checkoutItems = getSelectedItems();
    const checkoutTotal = selectedTotalPrice;

    // Group items by shop
    const groupItemsByShop = (items: typeof checkoutItems) => {
        const groups: Map<number, typeof checkoutItems> = new Map();
        items.forEach(item => {
            const shopId = item.shop_id;
            if (!groups.has(shopId)) {
                groups.set(shopId, []);
            }
            groups.get(shopId)!.push(item);
        });
        return groups;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!deliveryLocation) {
            setError('Silakan pilih lokasi pengantaran');
            setIsLoading(false);
            return;
        }

        if (checkoutItems.length === 0) {
            setError('Tidak ada item yang dipilih');
            setIsLoading(false);
            return;
        }

        try {
            const locationName = DELIVERY_LOCATIONS.find(loc => loc.id === deliveryLocation)?.name || deliveryLocation;
            const fullNotes = [
                `Lokasi: ${locationName}`,
                deliveryDescription ? `Detail: ${deliveryDescription}` : '',
                notes ? `Catatan: ${notes}` : '',
                `Pembayaran: ${paymentMethod === 'CASH' ? 'Tunai' : 'Midtrans'}`
            ].filter(Boolean).join(' | ');

            // Group items by shop
            const shopGroups = groupItemsByShop(checkoutItems);
            const orderIds: number[] = [];
            let totalAmount = 0;

            // Create order for each shop
            for (const [shopId, shopItems] of shopGroups) {
                console.log(`Creating order for shop ${shopId} with ${shopItems.length} items`);
                
                const orderResponse = await api.post('/orders', {
                    shop_id: shopId,
                    items: shopItems.map(item => ({
                        menu_id: item.id,
                        quantity: item.quantity
                    })),
                    table_number: locationName,
                    notes: fullNotes,
                    payment_method: paymentMethod
                });

                orderIds.push(orderResponse.data.order.id);
                totalAmount += parseFloat(orderResponse.data.order.total_amount);
            }

            console.log('Orders created:', orderIds);

            if (paymentMethod === 'CASH') {
                // For cash payment, show success and navigate to order history
                setShowSuccess(true);
                // Clear cart for selected items
                setTimeout(() => {
                    navigate('/orders', {
                        state: { message: 'Pesanan berhasil dibuat! Silakan bayar secara tunai saat menerima pesanan.' }
                    });
                }, 2000);
            } else {
                // For Midtrans, navigate to payment page
                navigate('/payment', {
                    state: {
                        orderId: orderIds[0],
                        orderIds: orderIds,
                        totalAmount: totalAmount
                    }
                });
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            console.error('Error response:', JSON.stringify(err.response?.data, null, 2));
            
            // Handle validation errors
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                const errorMessages = Object.values(errors).flat().join(', ');
                setError(errorMessages);
            } else {
                setError(err.response?.data?.message || err.response?.data?.error || 'Gagal memproses pesanan. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Redirect if no items selected
    useEffect(() => {
        if (checkoutItems.length === 0 && !showSuccess) {
            navigate('/cart');
        }
    }, [checkoutItems.length, navigate, showSuccess]);

    // Success modal for cash payment
    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                    <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 mb-6">
                        <CheckCircle className="h-10 w-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pesanan Berhasil!</h2>
                    <p className="text-gray-600 mb-6">
                        Pesanan Anda telah diterima. Silakan siapkan pembayaran tunai saat pesanan diantar.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                        Mengarahkan ke Riwayat Pesanan...
                    </div>
                </div>
            </div>
        );
    }

    if (checkoutItems.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen pb-32 md:pb-12">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg px-4 py-4 shadow-sm border-b border-gray-100 flex items-center max-w-7xl mx-auto w-full md:rounded-b-2xl md:mt-4 md:px-6">
                <button onClick={() => navigate(-1)} className="mr-3 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
                    <p className="text-xs text-gray-500">{selectedItemsCount} item dipilih</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto max-w-md px-4 py-6 space-y-4 md:max-w-7xl md:grid md:grid-cols-3 md:gap-6 md:space-y-0">
                {/* Left Column: Inputs */}
                <div className="md:col-span-2 space-y-4">
                    {/* Delivery Location Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-sm mr-3">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Lokasi Pengantaran</h2>
                                    <p className="text-xs text-gray-500">Pilih lokasi tujuan pesanan</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Location Select */}
                            <div>
                                <label htmlFor="delivery-location" className="block text-sm font-medium text-gray-700 mb-2">
                                    Pilih Lokasi <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        id="delivery-location"
                                        required
                                        value={deliveryLocation}
                                        onChange={(e) => setDeliveryLocation(e.target.value)}
                                        className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-3.5 pl-4 pr-10 appearance-none cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <option value="">-- Pilih Lokasi --</option>
                                        <optgroup label="Gedung">
                                            {DELIVERY_LOCATIONS.filter(loc => loc.id.startsWith('gedung')).map(loc => (
                                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Area Lainnya">
                                            {DELIVERY_LOCATIONS.filter(loc => !loc.id.startsWith('gedung') && !loc.id.startsWith('gazebo')).map(loc => (
                                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Gazebo">
                                            {DELIVERY_LOCATIONS.filter(loc => loc.id.startsWith('gazebo')).map(loc => (
                                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Delivery Description */}
                            <div>
                                <label htmlFor="delivery-description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Detail Lokasi <span className="text-gray-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    id="delivery-description"
                                    rows={2}
                                    value={deliveryDescription}
                                    onChange={(e) => setDeliveryDescription(e.target.value)}
                                    placeholder="Contoh: Lantai 2, Ruang 201, dekat tangga..."
                                    className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm placeholder:text-gray-400 hover:bg-gray-100 transition-colors px-4 py-3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-sm mr-3">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Catatan Pesanan</h2>
                                    <p className="text-xs text-gray-500">Instruksi khusus untuk penjual</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <textarea
                                id="notes"
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Contoh: Jangan terlalu pedas, es dipisah, tanpa bawang..."
                                className="block w-full rounded-xl border-gray-200 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm placeholder:text-gray-400 hover:bg-gray-100 transition-colors px-4 py-3"
                            />
                        </div>
                    </div>

                    {/* Payment Method Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-sm mr-3">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Metode Pembayaran</h2>
                                    <p className="text-xs text-gray-500">Pilih cara pembayaran</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {/* Midtrans Option */}
                            <label 
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    paymentMethod === 'MIDTRANS' 
                                        ? 'border-blue-500 bg-blue-50' 
                                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="MIDTRANS"
                                    checked={paymentMethod === 'MIDTRANS'}
                                    onChange={() => setPaymentMethod('MIDTRANS')}
                                    className="sr-only"
                                />
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-3 ${
                                    paymentMethod === 'MIDTRANS' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">Pembayaran Online</p>
                                    <p className="text-xs text-gray-500">QRIS, E-Wallet, Transfer Bank</p>
                                </div>
                                {paymentMethod === 'MIDTRANS' && (
                                    <CheckCircle className="h-6 w-6 text-blue-500" />
                                )}
                            </label>

                            {/* Cash Option */}
                            <label 
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    paymentMethod === 'CASH' 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="CASH"
                                    checked={paymentMethod === 'CASH'}
                                    onChange={() => setPaymentMethod('CASH')}
                                    className="sr-only"
                                />
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center mr-3 ${
                                    paymentMethod === 'CASH' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                    <Banknote className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">Bayar Tunai</p>
                                    <p className="text-xs text-gray-500">Bayar saat pesanan diantar</p>
                                </div>
                                {paymentMethod === 'CASH' && (
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Summary & Action */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        {/* Summary Header */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-sm mr-3">
                                    <Receipt className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Ringkasan Pesanan</h2>
                                    <p className="text-xs text-gray-500">{checkoutItems.length} item</p>
                                </div>
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="p-4">
                            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto -mx-1 px-1">
                                {checkoutItems.map((item) => (
                                    <li key={item.id} className="flex py-3 first:pt-0 last:pb-0">
                                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center">
                                                    <ShoppingBag className="h-6 w-6 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3 flex flex-1 flex-col justify-center min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                                                <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatRupiah(item.price * item.quantity)}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{item.quantity} x {formatRupiah(item.price)}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Total */}
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Subtotal</span>
                                    <span className="text-sm text-gray-900">{formatRupiah(checkoutTotal)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-gray-600">Biaya Layanan</span>
                                    <span className="text-sm text-green-600 font-medium">Gratis</span>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                    <span className="text-base font-bold text-gray-900">Total Bayar</span>
                                    <span className="text-xl font-bold text-blue-600">{formatRupiah(checkoutTotal)}</span>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Desktop Submit Button */}
                            <div className="hidden md:block mt-6">
                                <button
                                    type="submit"
                                    disabled={isLoading || !deliveryLocation}
                                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Truck className="h-5 w-5" />
                                            Pesan Sekarang
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Submit Button */}
                <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
                    <div className="max-w-md mx-auto">
                        <div className="h-4 bg-gradient-to-t from-white to-transparent"></div>
                        <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.15)] mb-[4.5rem]">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600">Total Bayar</span>
                                <span className="text-lg font-bold text-blue-600">{formatRupiah(checkoutTotal)}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !deliveryLocation}
                                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Truck className="h-5 w-5" />
                                        Pesan Sekarang
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
