import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Delicious Food, Delivered to Your Table
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Experience the best flavors from our canteen. Order online and skip the queue.
                            Fresh, hot, and ready when you are.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/menu"
                                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Order Now
                            </Link>
                            <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                                Log in <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
