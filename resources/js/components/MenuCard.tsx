import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { formatRupiah } from '../utils/formatRupiah';
import { Plus } from 'lucide-react';

export interface Menu {
    id: number;
    name: string;
    description: string;
    price: number;
    menu_category_id: number;
    image_url: string | null;
    status: string;
    shop_id: number;
    shop?: {
        id: number;
        name: string;
    };
}

interface MenuCardProps {
    menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addToCart({
            id: menu.id,
            name: menu.name,
            price: Number(menu.price),
            quantity: 1,
            image: menu.image_url || undefined,
            shop_id: menu.shop_id
        });
    };

    return (
        <Link to={`/menu/${menu.id}`} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-all">
            <div className="aspect-square w-full overflow-hidden bg-gray-100">
                <img
                    src={menu.image_url || 'https://placehold.co/300x300?text=No+Image'}
                    alt={menu.name}
                    className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-1">
                    <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        {menu.shop?.name || 'Unknown Shop'}
                    </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem]">
                    {menu.name}
                </h3>
                <div className="mt-2 flex items-end justify-between">
                    <p className="text-sm font-bold text-blue-600">{formatRupiah(menu.price)}</p>
                    <button
                        onClick={handleAddToCart}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
