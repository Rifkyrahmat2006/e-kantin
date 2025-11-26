import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function FloatingCart() {
    const { totalItems } = useCart();

    return (
        <Link
            to="/cart"
            className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            <div className="relative">
                <ShoppingCart className="h-8 w-8" />
                {totalItems > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {totalItems}
                    </span>
                )}
            </div>
        </Link>
    );
}
