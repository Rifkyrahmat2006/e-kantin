import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';

export interface Shop {
    id: number;
    name: string;
    description: string;
    image_url: string | null;
    status: string;
}

interface ShopCardProps {
    shop: Shop;
    variant?: 'horizontal' | 'vertical';
}

export default function ShopCard({ shop, variant = 'vertical' }: ShopCardProps) {
    const isHorizontal = variant === 'horizontal';

    return (
        <Link
            to={`/menu?shop_id=${shop.id}`}
            className={`group block overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md ${isHorizontal ? 'w-72 flex-shrink-0' : 'w-full'
                }`}
        >
            <div className={`relative overflow-hidden bg-gray-100 ${isHorizontal ? 'h-40' : 'h-48'}`}>
                <img
                    src={shop.image_url || 'https://placehold.co/600x400?text=No+Image'}
                    alt={shop.name}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ${shop.status === 'open'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                            }`}
                    >
                        {shop.status === 'open' ? 'Open' : 'Closed'}
                    </span>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 truncate">
                        {shop.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500">
                        <Star className="mr-1 h-3 w-3 fill-orange-400 text-orange-400" />
                        <span>4.8</span>
                    </div>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {shop.description}
                </p>
                <div className="mt-3 flex items-center text-xs text-gray-400">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>10-20 min</span>
                </div>
            </div>
        </Link>
    );
}
