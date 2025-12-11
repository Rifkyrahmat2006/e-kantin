import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';
import { Clock, CheckCircle2, XCircle, ChevronRight, Store, ShoppingBag, Loader2, CreditCard, Truck } from 'lucide-react';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    menu: {
        name: string;
        image_url: string | null;
    };
}

interface Shop {
    id: number;
    name: string;
}

interface Order {
    id: number;
    created_at: string;
    total_amount: number;
    order_status: string;
    order_items: OrderItem[];
    shop: Shop;
}

type TabType = 'all' | 'pending' | 'processing' | 'completed';

export default function OrderHistory() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data.orders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return order.order_status === 'PENDING';
        if (activeTab === 'processing') return order.order_status === 'PROCESSING';
        if (activeTab === 'completed') return order.order_status === 'COMPLETED' || order.order_status === 'CANCELLED';
        return true;
    });

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return {
                    color: 'bg-green-100 text-green-700',
                    icon: <CheckCircle2 className="h-4 w-4 mr-1.5" />,
                    label: 'Selesai'
                };
            case 'PENDING':
                return {
                    color: 'bg-orange-100 text-orange-700',
                    icon: <Clock className="h-4 w-4 mr-1.5" />,
                    label: 'Belum Bayar'
                };
            case 'PROCESSING':
                return {
                    color: 'bg-blue-100 text-blue-700',
                    icon: <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />,
                    label: 'Diproses'
                };
            case 'CANCELLED':
                return {
                    color: 'bg-red-100 text-red-700',
                    icon: <XCircle className="h-4 w-4 mr-1.5" />,
                    label: 'Dibatalkan'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-700',
                    icon: <Clock className="h-4 w-4 mr-1.5" />,
                    label: status
                };
        }
    };

    const handlePayNow = (e: React.MouseEvent, order: Order) => {
        e.preventDefault();
        navigate('/payment', {
            state: {
                orderId: order.id,
                totalAmount: order.total_amount
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-gray-500">Memuat riwayat pesanan...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm md:shadow-none md:static">
                <div className="max-w-3xl mx-auto px-4 py-4 md:py-8">
                    <h1 className="text-xl font-bold text-gray-900 md:text-2xl mb-4">Riwayat Pesanan</h1>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'all', label: 'Semua' },
                            { id: 'pending', label: 'Belum Bayar' },
                            { id: 'processing', label: 'Diproses' },
                            { id: 'completed', label: 'Selesai' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 mt-4 space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Belum ada pesanan</h3>
                        <p className="text-gray-500 mt-1 max-w-xs">Pesanan Anda akan muncul di sini setelah Anda melakukan checkout.</p>
                        <Link 
                            to="/menu" 
                            className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                        >
                            Mulai Pesan
                        </Link>
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const status = getStatusConfig(order.order_status);
                        
                        return (
                            <div key={order.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                                {/* Header Card */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Store className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{order.shop?.name || 'Kantin Teknik'}</h3>
                                            <p className="text-xs text-gray-500">
                                                Order #{order.id} • {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${status.color}`}>
                                        {status.icon}
                                        {status.label}
                                    </div>
                                </div>

                                {/* Order Items Preview */}
                                <div className="space-y-4 mb-4">
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
                                                <h4 className="font-semibold text-gray-900 line-clamp-1">{item.menu.name}</h4>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        {item.quantity} x {formatRupiah(Number(item.unit_price))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer & Actions */}
                                <div className="flex items-end justify-between pt-2">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Total Pesanan</p>
                                        <p className="text-lg font-bold text-gray-900">{formatRupiah(Number(order.total_amount))}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link 
                                            to={`/orders/${order.id}`}
                                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                            Detail
                                        </Link>
                                        
                                        {order.order_status === 'PENDING' && (
                                            <button
                                                onClick={(e) => handlePayNow(e, order)}
                                                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
                                            >
                                                <CreditCard className="h-4 w-4" />
                                                Bayar
                                            </button>
                                        )}

                                        {order.order_status === 'PROCESSING' && (
                                            <button
                                                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center gap-2"
                                            >
                                                <Truck className="h-4 w-4" />
                                                Lacak
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
