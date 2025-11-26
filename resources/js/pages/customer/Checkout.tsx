import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import { formatRupiah } from '../../utils/formatRupiah';

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
            await api.post('/orders', {
                items: items.map(item => ({
                    menu_id: item.id,
                    quantity: item.quantity
                })),
                table_number: tableNumber,
                notes: notes
            });

            clearCart();
            navigate('/order-success');
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
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="sr-only">Checkout</h2>

                <form className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16" onSubmit={handleSubmit}>
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">Order Details</h2>

                        <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                            <div className="sm:col-span-2">
                                <label htmlFor="table-number" className="block text-sm font-medium text-gray-700">
                                    Table Number
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        id="table-number"
                                        name="table-number"
                                        required
                                        value={tableNumber}
                                        onChange={(e) => setTableNumber(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                    Notes (Optional)
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-10 lg:mt-0">
                        <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

                        <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                            <h3 className="sr-only">Items in your cart</h3>
                            <ul role="list" className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <li key={item.id} className="flex px-4 py-6 sm:px-6">
                                        <div className="flex-shrink-0">
                                            <div className="h-20 w-20 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        </div>

                                        <div className="ml-6 flex flex-1 flex-col">
                                            <div className="flex">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm">
                                                        <a href="#" className="font-medium text-gray-700 hover:text-gray-800">
                                                            {item.name}
                                                        </a>
                                                    </h4>
                                                </div>
                                            </div>

                                            <div className="flex flex-1 items-end justify-between pt-2">
                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {formatRupiah(item.price)} x {item.quantity}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <dl className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                                    <dt className="text-base font-medium text-gray-900">Total</dt>
                                    <dd className="text-base font-medium text-gray-900">{formatRupiah(totalPrice)}</dd>
                                </div>
                            </dl>

                            <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                {error && (
                                    <div className="mb-4 rounded-md bg-red-50 p-4">
                                        <div className="flex">
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:opacity-50"
                                >
                                    {isLoading ? 'Processing...' : 'Confirm Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
