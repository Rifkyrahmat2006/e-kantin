import {
    CheckCircle,
    Clock,
    Home,
    Share2,
    ShoppingBag,
    Store,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    menu: {
        name: string;
    };
}

interface Order {
    id: number;
    created_at: string;
    total_amount: number;
    order_status: string;
    payment_method: string;
    order_items: OrderItem[];
    shop: {
        id: number;
        name: string;
    };
}

export default function OrderSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const receiptRef = useRef<HTMLDivElement>(null);

    const state = location.state as { orderIds?: number[] } | null;
    const orderIds = state?.orderIds || [];

    useEffect(() => {
        if (orderIds.length === 0) {
            // No order IDs, redirect to orders page
            navigate('/orders', { replace: true });
            return;
        }

        const fetchOrders = async () => {
            try {
                const orderPromises = orderIds.map((id) =>
                    api.get(`/orders/${id}`),
                );
                const responses = await Promise.all(orderPromises);
                setOrders(responses.map((r) => r.data.order));
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [orderIds, navigate]);

    const handleShare = async () => {
        const shareData = {
            title: `E-Kantin Receipt #${orderIds.join('-')}`,
            text: `Pembayaran berhasil sebesar ${formatRupiah(totalAllOrders)} di E-Kantin Teknik. Kode Pemesanan: ${orderIds.join('-')}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(
                    `${shareData.title}\n${shareData.text}\n${shareData.url}`,
                );
                alert('Tautan struk berhasil disalin ke clipboard!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const totalAllOrders = orders.reduce(
        (sum, order) => sum + Number(order.total_amount),
        0,
    );
    const orderDate = orders[0]?.created_at
        ? new Date(orders[0].created_at)
        : new Date();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="font-medium text-gray-500">Memuat struk...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-12 font-sans sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md">
                {/* Animation & Success Header */}
                <div className="animate-fade-in-down mb-8 text-center">
                    <div className="animate-scale-up mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-xl ring-8 ring-green-100">
                        <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Pembayaran Berhasil!
                    </h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Terima kasih, pesanan Anda sedang disiapkan.
                    </p>
                </div>

                {/* Receipt Card */}
                <div className="relative isolate">
                    {/* Main Receipt Content */}
                    <div
                        ref={receiptRef}
                        className="relative z-10 overflow-hidden rounded-t-xl bg-white shadow-2xl print:shadow-none"
                    >
                        {/* Receipt Header */}
                        <div className="border-b border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                            <div className="mb-3 flex items-center justify-center gap-2 text-blue-600">
                                <Store className="h-6 w-6" />
                                <span className="text-xl font-bold tracking-tight">
                                    E-Kantin Teknik
                                </span>
                            </div>
                            <p className="text-uppercase text-xs tracking-widest text-gray-400">
                                OFFICIAL RECEIPT
                            </p>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-6">
                            {/* Meta Info */}
                            <div className="mb-6 grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="mb-1 text-gray-400">
                                        NO. PESANAN
                                    </p>
                                    <p className="font-mono text-sm font-bold text-gray-900">
                                        #{orderIds.join('-')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="mb-1 text-gray-400">
                                        TANGGAL
                                    </p>
                                    <p className="font-bold text-gray-900">
                                        {orderDate.toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: '2-digit',
                                        })}
                                        <span className="ml-2 font-normal text-gray-500">
                                            {orderDate.toLocaleTimeString(
                                                'id-ID',
                                                {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                },
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4 border-t border-dashed border-gray-300"></div>

                            {/* Order List */}
                            <div className="space-y-6">
                                {orders.map((order) => (
                                    <div key={order.id}>
                                        <div className="mb-3 flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600">
                                                <Store className="h-3 w-3" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">
                                                {order.shop?.name}
                                            </span>
                                        </div>
                                        <div className="space-y-3 border-l-2 border-gray-100 pl-3">
                                            {order.order_items.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <div className="flex-1 pr-4">
                                                        <span className="font-medium text-gray-700">
                                                            {item.menu.name}
                                                        </span>
                                                        <div className="text-xs text-gray-400">
                                                            Qty: {item.quantity}
                                                        </div>
                                                    </div>
                                                    <span className="font-mono font-medium text-gray-900">
                                                        {formatRupiah(
                                                            item.quantity *
                                                                Number(
                                                                    item.unit_price,
                                                                ),
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="my-6 border-t border-dashed border-gray-300 font-mono"></div>

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatRupiah(totalAllOrders)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Biaya Layanan</span>
                                    <span>Rp 0</span>
                                </div>
                                <div className="mt-4 flex items-center justify-between border-t border-gray-900 pt-4">
                                    <span className="text-base font-bold text-gray-900">
                                        TOTAL BAYAR
                                    </span>
                                    <span className="text-2xl font-bold tracking-tight text-blue-600">
                                        {formatRupiah(totalAllOrders)}
                                    </span>
                                </div>
                            </div>

                            {/* Status Badges */}
                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <div className="flex flex-col items-center justify-center rounded-xl border border-green-100 bg-green-50 p-3">
                                    <CheckCircle className="mb-1 h-5 w-5 text-green-600" />
                                    <span className="text-xs font-bold tracking-wide text-green-700 uppercase">
                                        LUNAS
                                    </span>
                                </div>
                                <div className="flex flex-col items-center justify-center rounded-xl border border-amber-100 bg-amber-50 p-3">
                                    <Clock className="mb-1 h-5 w-5 text-amber-600" />
                                    <span className="text-xs font-bold tracking-wide text-amber-700 uppercase">
                                        DIPROSES
                                    </span>
                                </div>
                            </div>

                            {/* Digital Barcode Simulation */}
                            <div className="mt-8">
                                <div className="h-12 w-full bg-[repeating-linear-gradient(90deg,currentColor_0,currentColor_1px,transparent_0,transparent_4px)] text-gray-800 opacity-20"></div>
                                <p className="mt-2 text-center font-mono text-xs tracking-widest text-gray-400">
                                    {orderIds.join('')}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 p-4 text-center">
                            <p className="text-xs font-medium text-gray-400">
                                Simpan bukti ini untuk pengambilan pesanan
                            </p>
                        </div>
                    </div>

                    {/* Jagged Edge CSS implemented via clip-path or gradient */}
                    <div
                        className="relative z-10 h-6 w-full bg-white"
                        style={{
                            backgroundImage:
                                'linear-gradient(45deg, transparent 50%, #fff 50%), linear-gradient(-45deg, transparent 50%, #fff 50%)',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 100%',
                            backgroundRepeat: 'repeat-x',
                            transform: 'rotate(180deg)', // To point downwards
                        }}
                    ></div>

                    {/* Shadow for jagged edge */}
                    <div
                        className="absolute right-0 -bottom-4 left-0 h-8 opacity-20"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, black 0%, transparent 70%)',
                        }}
                    ></div>
                </div>

                {/* Actions */}
                <div className="mt-8 space-y-4 print:hidden">
                    <button
                        onClick={handleShare}
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-transparent py-3.5 font-bold text-gray-600 transition-all hover:border-gray-400 hover:bg-white hover:text-gray-900"
                    >
                        <Share2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                        Bagikan Struk
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <Link
                            to="/orders"
                            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl active:scale-[0.98]"
                        >
                            <ShoppingBag className="h-5 w-5" />
                            Riwayat
                        </Link>
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 font-bold text-gray-700 shadow-lg shadow-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                        >
                            <Home className="h-5 w-5" />
                            Beranda
                        </Link>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        background-color: white;
                    } 
                    body * {
                        visibility: hidden;
                    }
                    .print\\:shadow-none,
                    .print\\:shadow-none * {
                        visibility: visible;
                    }
                    .print\\:shadow-none {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
                @keyframes fade-in-down {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scale-up {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.6s ease-out forwards;
                }
                .animate-scale-up {
                    animation: scale-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </div>
    );
}
