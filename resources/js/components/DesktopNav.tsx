import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, LogOut, UtensilsCrossed, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { formatRupiah } from '../utils/formatRupiah';

export default function DesktopNav() {
    const { user, logout } = useAuth();
    const { totalItems, totalPrice } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        navigate(`/?search=${encodeURIComponent(query)}`);
    };

    return (
        <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <div className="bg-blue-600 p-2 rounded-lg mr-2">
                            <UtensilsCrossed className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">E-Kantin</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-lg mx-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Cari makanan atau kantin..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-8">
                        <Link
                            to="/"
                            className={`text-sm font-medium ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/menu"
                            className={`text-sm font-medium ${isActive('/menu') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Kantin
                        </Link>
                        <Link
                            to="/orders"
                            className={`text-sm font-medium ${isActive('/orders') ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Pesanan
                        </Link>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-6 ml-8">
                        {/* Cart */}
                        <Link to="/cart" className="relative group">
                            <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                <ShoppingBag className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                                {totalItems > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                        </Link>

                        {/* User Profile / Logout */}
                        <div className="flex items-center space-x-4 border-l border-gray-200 pl-6">
                            {user ? (
                                <>
                                    <Link to="/profile">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    user.name.charAt(0)
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                        </div>
                                    </Link>
                                    {/* <button
                                        onClick={handleLogout}
                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button> */}
                                </>
                            ) : (
                                <Link to="/login">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Masuk</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
