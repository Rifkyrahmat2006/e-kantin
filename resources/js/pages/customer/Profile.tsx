import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Receipt, ChevronRight, Settings, LayoutDashboard, BookOpen } from 'lucide-react';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
            {/* Header */}
            <div className="bg-blue-600 px-4 pt-12 pb-8 rounded-b-[2rem] shadow-lg text-center md:bg-transparent md:shadow-none md:text-left md:pt-8 md:pb-4 md:rounded-none">
                <div className="max-w-4xl mx-auto md:flex md:items-center md:bg-white md:p-6 md:rounded-2xl md:shadow-sm">
                    <div className="mx-auto h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 border-2 border-white/30 md:mx-0 md:bg-blue-100 md:border-none md:mb-0 md:mr-6 overflow-hidden">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 text-white md:text-blue-600" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white md:text-gray-900 md:text-2xl">{user?.name || 'Guest'}</h1>
                        <p className="text-blue-100 text-sm md:text-gray-500">{user?.email || 'Please login'}</p>
                    </div>
                </div>
            </div>

            {/* Menu Options */}
            <div className="px-4 mt-6 space-y-4 max-w-4xl mx-auto md:mt-0">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:grid md:grid-cols-2 md:gap-4 md:bg-transparent md:shadow-none md:overflow-visible">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:hover:shadow-md"
                    >
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mr-4">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-gray-900">Riwayat Pesanan</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>

                    {user?.role === 'admin' && (
                        <button
                            onClick={() => window.location.href = '/admin'}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:hover:shadow-md"
                        >
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mr-4">
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                                <span className="font-medium text-gray-900">Dashboard Admin</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/guide')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:hover:shadow-md"
                    >
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 mr-4">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-gray-900">Panduan Pengguna</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:hover:shadow-md"
                    >
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mr-4">
                                <Settings className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-gray-900">Pengaturan Akun</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden md:bg-transparent md:shadow-none">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group md:bg-white md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:hover:shadow-md md:hover:border-red-200"
                    >
                        <div className="flex items-center">
                            <div className="h-10 w-10 bg-red-50 rounded-full flex items-center justify-center text-red-600 mr-4 group-hover:bg-red-100">
                                <LogOut className="h-5 w-5" />
                            </div>
                            <span className="font-medium text-red-600">Keluar</span>
                        </div>
                    </button>
                </div>
            </div>

            <div className="text-center mt-8 text-xs text-gray-400">
                Version 1.0.0
            </div>
        </div>
    );
}
