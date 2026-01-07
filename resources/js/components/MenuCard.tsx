import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatRupiah } from '../utils/formatRupiah';

export interface Menu {
    id: number;
    name: string;
    description: string;
    price: number;
    menu_category_id: number;
    image_url: string | null;
    status: string;
    shop_id: number;
    average_rating?: number;
    total_sold?: number;
    shop?: {
        id: number;
        name: string;
    };
}

interface MenuCardProps {
    menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {

    return (
        <Link
            to={`/menu/${menu.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md"
        >
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
                <img
                    src={
                        menu.image_url ||
                        'https://placehold.co/300x300?text=No+Image'
                    }
                    alt={menu.name}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex flex-1 flex-col p-4">
                <span className="mb-1 block truncate text-xs font-medium text-gray-500">
                    {menu.shop?.name || 'Unknown Shop'}
                </span>
                <h3 className="line-clamp-2 min-h-[1.5rem] text-sm font-bold text-gray-900">
                    {menu.name}
                </h3>
                {/* Star Rating */}
                <div className="mt-1 inline-flex w-fit items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-600">
                        {menu.average_rating || '0'}
                    </span>
                </div>
                {/* Price and Sold Count */}
                <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="whitespace-nowrap text-base font-bold text-blue-600">
                        {formatRupiah(menu.price)}
                    </p>
                    {menu.total_sold !== undefined && menu.total_sold > 0 && (
                        <span className="whitespace-nowrap text-xs text-gray-400">
                            {menu.total_sold}+ terjual
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
