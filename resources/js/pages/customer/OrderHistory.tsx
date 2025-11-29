import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';
import { Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    menu: {
        name: string;
        image_url: string | null;
    };
}

interface Order {
    id: number;
    created_at: string;
    total_amount: number;
    order_status: string;
    order_items: OrderItem[];
}

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
                return <CheckCircle2 className="h-4 w-4 mr-1" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4 mr-1" />;
            default:
                return <Clock className="h-4 w-4 mr-1" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
            <div className="bg-white px-4 py-6 shadow-sm mb-4 md:bg-transparent md:shadow-none md:pt-8 md:pb-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Riwayat Pesanan</h1>
                </div>
            </div>

            <div className="px-4 max-w-7xl mx-auto">
                {orders.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Belum ada pesanan.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center">
                                        <div className={`flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                            {getStatusIcon(order.order_status)}
                                            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {formatRupiah(Number(order.total_amount))}
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {order.order_items.slice(0, 3).map((item) => (
                                        <div key={item.id} className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                {item.menu.image_url ? (
                                                    <img
                                                        src={item.menu.image_url}
                                                        alt={item.menu.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {item.menu.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {item.quantity} x {formatRupiah(Number(item.unit_price))}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.order_items.length > 3 && (
                                        <p className="text-xs text-gray-500 text-center pt-1">
                                            + {order.order_items.length - 3} menu lainnya
                                        </p>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                                    <Link to={`/orders/${order.id}`} className="text-sm font-medium text-blue-600 flex items-center hover:text-blue-700">
                                        Lihat Detail <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
