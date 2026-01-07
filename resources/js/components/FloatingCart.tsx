import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';


export default function FloatingCart() {
    const { totalItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // Don't show on cart, checkout, or menu detail pages
    if (
        location.pathname === '/cart' || 
        location.pathname === '/checkout' || 
        location.pathname.startsWith('/menu/') ||
        totalItems === 0
    ) {
        return null;
    }

    return (
        <div className="fixed bottom-24 right-4 z-40 md:bottom-8 md:right-8">
            <button
                onClick={() => navigate('/cart')}
                className="relative bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform active:scale-[0.95] flex items-center justify-center"
            >
                <ShoppingBag className="h-6 w-6" />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white">
                    {totalItems}
                </div>
            </button>
        </div>
    );
}
