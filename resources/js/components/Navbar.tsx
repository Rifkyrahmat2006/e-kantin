import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const { totalItems } = useCart();

    return (
        <nav className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <Link to="/" className="text-xl font-bold text-blue-600">
                                Kantin FT
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/" className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
                                Home
                            </Link>

                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">

                        {isAuthenticated ? (
                            <div className="ml-3 relative flex items-center space-x-4">
                                {user?.role === 'admin' && (
                                    <a href="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900">
                                        Dashboard
                                    </a>
                                )}
                                <span className="mr-2">{user?.name}</span>
                                <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-900">Logout</button>
                            </div>
                        ) : (
                            <div className="ml-4 flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900">Log in</Link>
                                <Link to="/register" className="text-sm font-medium text-blue-600 hover:text-blue-500">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
