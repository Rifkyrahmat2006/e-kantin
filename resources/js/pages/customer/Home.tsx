import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, UtensilsCrossed, Search } from 'lucide-react';
import api from '../../lib/api';
import MenuCard, { Menu } from '../../components/MenuCard';
import { Shop } from '../../components/ShopCard';

interface MenuWithShop extends Menu {
    shop: Shop;
}

export default function Home() {
    const [menus, setMenus] = useState<MenuWithShop[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await api.get('/menus');
                // Randomize menus
                const shuffled = response.data.menus.sort(() => 0.5 - Math.random());
                setMenus(shuffled);
            } catch (error) {
                console.error('Failed to fetch menus:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMenus();
    }, []);

    const navigate = useNavigate();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        navigate(`/?search=${encodeURIComponent(query)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white px-4 pt-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Selamat Datang!</h1>
                        <p className="text-sm text-gray-500 mt-1">Mau makan apa hari ini?</p>
                    </div>
                    <div className="p-2 bg-gray-50 rounded-full">
                        <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Sticky Search Bar (Mobile Only) */}
            <div className="sticky top-0 z-30 bg-white px-4 py-4 shadow-sm md:hidden">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari menu atau kantin..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-sm text-gray-500">Memuat menu lezat...</p>
                    </div>
                ) : (
                    <>
                        {menus.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {menus
                                    .filter(menu =>
                                        menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        menu.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        menu.shop?.name.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((menu) => (
                                        <MenuCard key={menu.id} menu={menu} />
                                    ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-75">
                                <UtensilsCrossed className="h-12 w-12 text-gray-300 mb-3" />
                                <p className="font-medium text-gray-900">Menu tidak ditemukan</p>
                                <p className="text-sm text-gray-500">Coba cari dengan kata kunci lain</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
