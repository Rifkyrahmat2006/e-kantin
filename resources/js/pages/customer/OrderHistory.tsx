import { useState, useEffect } from 'react';
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

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:pb-24">
                <div className="max-w-xl">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Order History</h1>
                    <p className="mt-2 text-sm text-gray-500">Check the status of your recent orders.</p>
                </div>

                <div className="mt-16">
                    <h2 className="sr-only">Recent orders</h2>

                    <div className="space-y-20">
                        {orders.map((order) => (
                            <div key={order.id}>
                                <div className="rounded-lg bg-gray-50 px-4 py-6 sm:flex sm:items-center sm:justify-between sm:space-x-6 sm:px-6 lg:space-x-8">
                                    <dl className="flex-auto space-y-6 divide-y divide-gray-200 text-sm text-gray-600 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:space-y-0 sm:divide-y-0 lg:w-1/2 lg:flex-none lg:gap-x-8">
                                        <div className="flex justify-between sm:block">
                                            <dt className="font-medium text-gray-900">Date placed</dt>
                                            <dd className="sm:mt-1">
                                                <time dateTime={order.created_at}>
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </time>
                                            </dd>
                                        </div>
                                        <div className="flex justify-between pt-6 sm:block sm:pt-0">
                                            <dt className="font-medium text-gray-900">Order number</dt>
                                            <dd className="sm:mt-1">#{order.id}</dd>
                                        </div>
                                        <div className="flex justify-between pt-6 font-medium text-gray-900 sm:block sm:pt-0">
                                            <dt>Total amount</dt>
                                            <dd className="sm:mt-1">{formatRupiah(Number(order.total_amount))}</dd>
                                        </div>
                                    </dl>
                                    <div className="mt-6 flex items-center space-x-4 divide-x divide-gray-200 border-t border-gray-200 pt-4 text-sm font-medium sm:ml-4 sm:mt-0 sm:border-none sm:pt-0">
                                        <div className="flex flex-1 justify-center">
                                            <p className="whitespace-nowrap text-blue-600">{order.order_status}</p>
                                        </div>
                                    </div>
                                </div>

                                <table className="mt-4 w-full text-gray-500 sm:mt-6">
                                    <caption className="sr-only">Products</caption>
                                    <thead className="sr-only text-left text-sm text-gray-500 sm:not-sr-only">
                                        <tr>
                                            <th scope="col" className="py-3 pr-8 font-normal sm:w-2/5 lg:w-1/3">
                                                Product
                                            </th>
                                            <th scope="col" className="hidden w-1/5 py-3 pr-8 font-normal sm:table-cell">
                                                Price
                                            </th>
                                            <th scope="col" className="hidden py-3 pr-8 font-normal sm:table-cell">
                                                Quantity
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 border-b border-gray-200 text-sm sm:border-t">
                                        {order.order_items && order.order_items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-6 pr-8">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.menu.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="hidden py-6 pr-8 sm:table-cell">
                                                    {formatRupiah(Number(item.unit_price))}
                                                </td>
                                                <td className="hidden py-6 pr-8 sm:table-cell">
                                                    {item.quantity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
