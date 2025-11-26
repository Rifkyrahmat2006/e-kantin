import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import CartItem from '../../components/CartItem';
import { formatRupiah } from '../../utils/formatRupiah';

export default function Cart() {
    const { items, totalPrice } = useCart();

    if (items.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Your cart is empty</h2>
                <p className="mt-4 text-gray-500">Looks like you haven't added anything to your cart yet.</p>
                <Link
                    to="/menu"
                    className="mt-8 rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    Start Ordering
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:px-0">
                <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Shopping Cart</h1>

                <form className="mt-12">
                    <section aria-labelledby="cart-heading">
                        <h2 id="cart-heading" className="sr-only">
                            Items in your shopping cart
                        </h2>

                        <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
                            {items.map((item) => (
                                <CartItem key={item.id} item={item} />
                            ))}
                        </ul>
                    </section>

                    {/* Order summary */}
                    <section aria-labelledby="summary-heading" className="mt-10">
                        <h2 id="summary-heading" className="sr-only">
                            Order summary
                        </h2>

                        <div>
                            <dl className="space-y-4">
                                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                    <dt className="text-base font-medium text-gray-900">Order total</dt>
                                    <dd className="text-base font-medium text-gray-900">{formatRupiah(totalPrice)}</dd>
                                </div>
                            </dl>

                            <div className="mt-6">
                                <Link
                                    to="/checkout"
                                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50"
                                >
                                    Checkout
                                </Link>
                            </div>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
}
