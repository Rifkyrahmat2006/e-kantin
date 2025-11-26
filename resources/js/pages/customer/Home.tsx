import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

interface Shop {
    id: number;
    name: string;
    description: string;
    image_logo: string;
    status: string;
}

export default function Home() {
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const response = await api.get('/shops');
                setShops(response.data.shops);
            } catch (error) {
                console.error('Error fetching shops:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShops();
    }, []);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:py-32">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Delicious Food, Delivered to Your Table
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Choose a shop and start ordering!
                        </p>
                    </div>
                </div>
            </div>

            {/* Shop List */}
            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Our Shops</h2>

                {isLoading ? (
                    <div className="text-center">Loading shops...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                        {shops.map((shop) => (
                            <Link key={shop.id} to={`/menu?shop_id=${shop.id}`} className="group">
                                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                                    <img
                                        src={shop.image_logo ? `/storage/${shop.image_logo}` : 'https://placehold.co/300x300?text=No+Image'}
                                        alt={shop.name}
                                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-medium text-gray-900">{shop.name}</h3>
                                <p className="mt-1 text-sm text-gray-500">{shop.description}</p>
                                <span className={`mt-2 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${shop.status === 'open'
                                        ? 'bg-green-50 text-green-700 ring-green-600/20'
                                        : 'bg-red-50 text-red-700 ring-red-600/20'
                                    }`}>
                                    {shop.status.toUpperCase()}
                                </span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
