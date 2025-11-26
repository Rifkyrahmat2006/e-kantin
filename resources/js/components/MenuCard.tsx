import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';
import { formatRupiah } from '../utils/formatRupiah';

interface Menu {
    id: number;
    name: string;
    description: string;
    price: number;
    menu_category_id: number;
    image?: string;
    status: string;
    shop_id: number;
}

interface MenuCardProps {
    menu: Menu;
}

export default function MenuCard({ menu }: MenuCardProps) {
    const { addToCart } = useCart();

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-64">
                <div className="flex h-full items-center justify-center bg-gray-100 text-gray-500">
                    {/* Placeholder for image */}
                    <span>No Image</span>
                </div>
            </div>
            <div className="flex flex-1 flex-col space-y-2 p-4">
                <h3 className="text-sm font-medium text-gray-900">
                    <Link to={`/menu/${menu.id}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {menu.name}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500">{menu.description}</p>
                <div className="flex flex-1 flex-col justify-end">
                    <p className="text-base font-medium text-gray-900">{formatRupiah(menu.price)}</p>
                </div>
            </div>
            <div className="p-4 pt-0">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                            id: menu.id,
                            name: menu.name,
                            price: Number(menu.price),
                            quantity: 1,
                            image: menu.image,
                            shop_id: menu.shop_id
                        });
                    }}
                    className="relative z-10 flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
}
