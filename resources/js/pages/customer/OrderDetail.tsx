import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, MapPin, ShoppingBag } from 'lucide-react';
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

interface Order {
    id: number;
    created_at: string;
    total_amount: number;
    order_status: string;
    order_items: OrderItem[];
    payment_method?: string;
    notes?: string;
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="h-5 w-5 mr-2" />;
            case 'cancelled':
                return <XCircle className="h-5 w-5 mr-2" />;
            default:
                return <Clock className="h-5 w-5 mr-2" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
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

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white px-4 py-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate('/orders')}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <h1 className="ml-2 text-lg font-bold text-gray-900">Detail Pesanan</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-4">
                {/* Status Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">No. Pesanan #{order.id}</span>
                        <span className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className={`flex items-center p-3 rounded-xl ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        <span className="font-medium capitalize">
                            {order.order_status}
                        </span>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-2 text-blue-600" />
                        Daftar Menu
                    </h2>
                    <div className="space-y-4">
                        {order.order_items.map((item) => (
                            <div key={item.id} className="flex gap-3">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
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
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 line-clamp-1">{item.menu.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {item.quantity} x {formatRupiah(Number(item.unit_price))}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">
                                        {formatRupiah(item.quantity * Number(item.unit_price))}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Detail */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4">Rincian Pembayaran</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Total Harga ({order.order_items.length} menu)</span>
                            <span>{formatRupiah(Number(order.total_amount))}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Biaya Layanan</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total Bayar</span>
                            <span>{formatRupiah(Number(order.total_amount))}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
