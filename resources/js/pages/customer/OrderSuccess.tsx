import { Link } from 'react-router-dom';

export default function OrderSuccess() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-xl text-center">
                <h1 className="text-4xl font-bold tracking-tight text-green-600 sm:text-5xl">Order Placed!</h1>
                <p className="mt-4 text-lg text-gray-500">
                    Your order has been successfully placed. We'll start preparing it right away.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link
                        to="/menu"
                        className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        Order More
                    </Link>
                    <Link to="/orders" className="text-sm font-semibold leading-6 text-gray-900">
                        View Order History <span aria-hidden="true">→</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
