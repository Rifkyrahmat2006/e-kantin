import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    Loader2,
    ShoppingBag,
    Store,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// Countdown Timer Component
function CountdownTimer({ createdAt }: { createdAt: string }) {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const created = new Date(createdAt).getTime();
            const expiry = created + 60 * 60 * 1000; // 1 hour from creation
            const now = Date.now();
            const diff = expiry - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [createdAt]);

    if (isExpired) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div>
                    <p className="text-sm font-semibold text-red-700">
                        Waktu Pembayaran Habis
                    </p>
                    <p className="mt-0.5 text-xs text-red-600">
                        Pesanan akan otomatis dibatalkan
                    </p>
                </div>
            </div>
        );
    }

    if (!timeLeft) return null;

    const formatNumber = (n: number) => n.toString().padStart(2, '0');
    const isUrgent = timeLeft.hours === 0 && timeLeft.minutes < 10;

    return (
        <div
            className={`rounded-xl border p-4 ${isUrgent ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`rounded-full p-2 ${isUrgent ? 'bg-red-100' : 'bg-amber-100'}`}
                >
                    <Clock
                        className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}
                    />
                </div>
                <div className="flex-1">
                    <p
                        className={`text-xs font-medium ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}
                    >
                        Selesaikan pembayaran dalam
                    </p>
                    <div className="mt-1 flex items-center gap-1">
                        <div
                            className={`rounded-lg px-2 py-1 font-mono text-lg font-bold ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                            {formatNumber(timeLeft.hours)}
                        </div>
                        <span
                            className={`text-lg font-bold ${isUrgent ? 'text-red-500' : 'text-amber-500'}`}
                        >
                            :
                        </span>
                        <div
                            className={`rounded-lg px-2 py-1 font-mono text-lg font-bold ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                            {formatNumber(timeLeft.minutes)}
                        </div>
                        <span
                            className={`text-lg font-bold ${isUrgent ? 'text-red-500' : 'text-amber-500'}`}
                        >
                            :
                        </span>
                        <div
                            className={`rounded-lg px-2 py-1 font-mono text-lg font-bold ${isUrgent ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}
                        >
                            {formatNumber(timeLeft.seconds)}
                        </div>
                    </div>
                </div>
            </div>
            {isUrgent && (
                <p className="mt-2 text-xs font-medium text-red-600">
                    ⚠️ Segera bayar! Pesanan akan dibatalkan jika melebihi
                    waktu.
                </p>
            )}
        </div>
    );
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
                    icon: <CheckCircle2 className="mr-2 h-5 w-5" />,
                    label: 'Selesai',
                    desc: 'Pesanan telah selesai',
                };
            case 'PENDING':
                return {
                    color: 'bg-orange-50 text-orange-700 border-orange-200',
                    icon: <Clock className="mr-2 h-5 w-5" />,
                    label: 'Belum Bayar',
                    desc: 'Menunggu pembayaran Anda',
                };
            case 'PROCESSING':
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: <Loader2 className="mr-2 h-5 w-5 animate-spin" />,
                    label: 'Diproses',
                    desc: 'Pesanan sedang disiapkan',
                };
            case 'CANCELLED':
                return {
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: <XCircle className="mr-2 h-5 w-5" />,
                    label: 'Dibatalkan',
                    desc: 'Pesanan dibatalkan',
                };
            default:
                return {
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                    icon: <Clock className="mr-2 h-5 w-5" />,
                    label: status,
                    desc: 'Status pesanan',
                };
        }
    };

    const handlePayNow = () => {
        if (order) {
            navigate('/payment', {
                state: {
                    orderId: order.id,
                    totalAmount: order.total_amount,
                },
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
                    className="mt-4 font-medium text-blue-600 hover:underline"
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
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white shadow-sm">
                <div className="mx-auto flex max-w-2xl items-center px-4 py-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="mr-2 -ml-2 rounded-full p-2 transition-colors hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            Detail Pesanan
                        </h1>
                        <p className="text-xs text-gray-500">
                            Order #{order.id}
                        </p>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-2xl space-y-4 p-4">
                {/* Countdown Timer for Pending Orders */}
                {order.order_status === 'PENDING' &&
                    order.payment_method !== 'cash' && (
                        <CountdownTimer createdAt={order.created_at} />
                    )}

                {/* Status Card */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                            Status Pesanan
                        </span>
                        <span className="text-xs text-gray-400">
                            {new Date(order.created_at).toLocaleString(
                                'id-ID',
                                {
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                },
                            )}
                        </span>
                    </div>
                    <div
                        className={`flex items-center rounded-xl border p-4 ${status.color}`}
                    >
                        {status.icon}
                        <div>
                            <span className="block text-sm font-bold">
                                {status.label}
                            </span>
                            <span className="text-xs opacity-80">
                                {status.desc}
                            </span>
                        </div>
                    </div>

                    {order.order_status === 'PENDING' && (
                        <button
                            onClick={handlePayNow}
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-[0.98]"
                        >
                            <CreditCard className="h-5 w-5" />
                            Bayar Sekarang
                        </button>
                    )}
                </div>

                {/* Shop Info */}
                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Store className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">
                            {order.shop?.name || 'Kantin Teknik'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            Kantin Fakultas Teknik
                        </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                </div>

                {/* Order Items */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center font-bold text-gray-900">
                        <ShoppingBag className="mr-2 h-5 w-5 text-blue-600" />
                        Daftar Menu
                    </h2>
                    <div className="space-y-5">
                        {order.order_items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                                    {item.menu.image_url ? (
                                        <img
                                            src={item.menu.image_url}
                                            alt={item.menu.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                            No Img
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                                        {item.menu.name}
                                    </h3>
                                    <div className="mt-1 flex items-end justify-between">
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} x{' '}
                                            {formatRupiah(
                                                Number(item.unit_price),
                                            )}
                                        </p>
                                        <p className="font-bold text-gray-900">
                                            {formatRupiah(
                                                item.quantity *
                                                    Number(item.unit_price),
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Detail */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 font-bold text-gray-900">
                        Rincian Pembayaran
                    </h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>
                                Total Harga ({order.order_items.length} menu)
                            </span>
                            <span>
                                {formatRupiah(Number(order.total_amount))}
                            </span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Biaya Layanan</span>
                            <span>Rp 0</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between border-t border-dashed border-gray-200 pt-3">
                            <span className="font-medium text-gray-900">
                                Total Bayar
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                                {formatRupiah(Number(order.total_amount))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
