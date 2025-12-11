import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, MapPin, ShoppingBag, Store, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    menu: {
        name: string;
        image_url: string | null;
        description: string;
    };
}

interface Shop {
    id: number;
    name: string;
    image_url: string | null;
}

interface Order {
    id: number;
    created_at: string;
    total_amount: number;
    order_status: string;
    order_items: OrderItem[];
    payment_method?: string;
    notes?: string;
    shop: Shop;
}

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`/orders/${id}`);
                setOrder(response.data.order);
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return {
                    color: 'bg-green-50 text-green-700 border-green-200',
                    icon: <CheckCircle2 className="h-5 w-5 mr-2" />,
                    label: 'Selesai',
                    desc: 'Pesanan telah selesai'
                };
            case 'PENDING':
                return {
                    color: 'bg-orange-50 text-orange-700 border-orange-200',
                    icon: <Clock className="h-5 w-5 mr-2" />,
                    label: 'Belum Bayar',
                    desc: 'Menunggu pembayaran Anda'
                };
            case 'PROCESSING':
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: <Loader2 className="h-5 w-5 mr-2 animate-spin" />,
                    label: 'Diproses',
                    desc: 'Pesanan sedang disiapkan'
                };
            case 'CANCELLED':
                return {
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: <XCircle className="h-5 w-5 mr-2" />,
                    label: 'Dibatalkan',
                    desc: 'Pesanan dibatalkan'
                };
            default:
                return {
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                    icon: <Clock className="h-5 w-5 mr-2" />,
                    label: status,
                    desc: 'Status pesanan'
                };
        }
    };

    const handlePayNow = () => {
        if (order) {
            navigate('/payment', {
                state: {
                    orderId: order.id,
                    totalAmount: order.total_amount
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <p className="text-gray-500">Pesanan tidak ditemukan</p>
                <button
                    onClick={() => navigate('/orders')}
                    className="mt-4 text-blue-600 font-medium hover:underline"
                >
                    Kembali ke Riwayat
                </button>
            </div>
        );
    }

    const status = getStatusConfig(order.order_status);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <div className="flex items-center max-w-2xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="p-2 -ml-2 mr-2 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Detail Pesanan</h1>
                        <p className="text-xs text-gray-500">Order #{order.id}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Status Card */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Status Pesanan</span>
                        <span className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString('id-ID', {
                                day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className={`flex items-center p-4 rounded-xl border ${status.color}`}>
                        {status.icon}
                        <div>
                            <span className="font-bold block text-sm">{status.label}</span>
                            <span className="text-xs opacity-80">{status.desc}</span>
                        </div>
                    </div>
                    
                    {order.order_status === 'PENDING' && (
                        <button
                            onClick={handlePayNow}
                            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <CreditCard className="h-5 w-5" />
                            Bayar Sekarang
                        </button>
                    )}
                </div>

                {/* Shop Info */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{order.shop?.name || 'Kantin Teknik'}</h3>
                        <p className="text-xs text-gray-500">Kantin Fakultas Teknik</p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2 text-blue-600" />
                        Daftar Menu
                    </h2>
                    <div className="space-y-5">
                        {order.order_items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-100">
                                    {item.menu.image_url ? (
                                        <img
                                            src={item.menu.image_url}
                                            alt={item.menu.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2">{item.menu.name}</h3>
                                    <div className="flex justify-between items-end mt-1">
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} x {formatRupiah(Number(item.unit_price))}
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {formatRupiah(item.quantity * Number(item.unit_price))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Detail */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-900 mb-4">Rincian Pembayaran</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Total Harga ({order.order_items.length} menu)</span>
                            <span>{formatRupiah(Number(order.total_amount))}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Biaya Layanan</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 mt-2 pt-3 flex justify-between items-center">
                            <span className="font-medium text-gray-900">Total Bayar</span>
                            <span className="font-bold text-lg text-blue-600">{formatRupiah(Number(order.total_amount))}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
