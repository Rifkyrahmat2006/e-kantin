import { Link, useLocation } from 'react-router-dom';
import { Home, UtensilsCrossed, ShoppingCart, Clock, User, LucideIcon } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

interface NavItem {
    path: string;
    icon: LucideIcon;
    label: string;
    badge?: number;
}

export default function BottomNav() {
    const location = useLocation();
    const { totalItems } = useCart();

    const isActive = (path: string) => location.pathname === path;

    const navItems: NavItem[] = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/menu', icon: UtensilsCrossed, label: 'Kantin' },
        // { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: totalItems }, // Cart is now floating
        { path: '/orders', icon: Clock, label: 'Pesanan' },
        { path: '/profile', icon: User, label: 'Profil' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <div className="relative">
                                <item.icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                {item.badge ? (
                                    <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
