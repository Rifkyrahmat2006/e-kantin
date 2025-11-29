import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import MenuCard, { Menu as MenuType } from '../../components/MenuCard';
import ShopCard, { Shop } from '../../components/ShopCard';
import { ChevronLeft, Search, Store } from 'lucide-react';

interface Category {
    id: number;
    name: string;
}

export default function Menu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menus, setMenus] = useState<MenuType[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const shopId = searchParams.get('shop_id');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                if (shopId) {
                    // Fetch Menus for a specific Shop
                    const [categoriesRes, menusRes] = await Promise.all([
                        api.get('/categories'),
                        api.get(`/menus?shop_id=${shopId}`)
                    ]);
                    setCategories(categoriesRes.data.categories);
                    setMenus(menusRes.data.menus);
                } else if (searchQuery) {
                    // Global Search for Menus
                    const response = await api.get(`/menus?search=${searchQuery}`);
                    setMenus(response.data.menus);
                } else {
                    // Fetch All Shops (Canteens)
                    const response = await api.get('/shops');
                    setShops(response.data.shops);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [shopId, searchQuery]);

    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    // Filter logic
    const filteredItems = shopId
        ? (selectedCategory
            ? menus.filter(menu => menu.menu_category_id === selectedCategory)
            : menus).filter(menu => menu.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : shops.filter(shop => shop.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="bg-gray-50 min-h-screen pb-20 md:pb-8">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white shadow-sm">
                <div className="flex items-center px-4 py-3 max-w-7xl mx-auto w-full">
                    {shopId && (
                        <button onClick={() => navigate(-1)} className="mr-3 p-1 rounded-full hover:bg-gray-100">
                            <ChevronLeft className="h-6 w-6 text-gray-700" />
                        </button>
                    )}
                    {!shopId && (
                        <div className="mr-3 p-1">
                            <Store className="h-6 w-6 text-blue-600" />
                        </div>
                    )}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={shopId ? "Cari menu..." : "Cari kantin..."}
                            className="w-full rounded-full bg-gray-100 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category Filter (Only for Menu View) */}
                {shopId && (
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="flex space-x-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === null
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Semua
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Grid */}
            <div className="p-4 max-w-7xl mx-auto">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    {shopId ? 'Daftar Menu' : 'Daftar Kantin'}
                </h2>

                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 rounded-2xl bg-gray-200 animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {shopId || searchQuery ? (
                            (filteredItems as MenuType[]).map((menu) => (
                                <MenuCard key={menu.id} menu={menu} />
                            ))
                        ) : (
                            (filteredItems as Shop[]).map((shop) => (
                                <ShopCard key={shop.id} shop={shop} variant="vertical" />
                            ))
                        )}
                    </div>
                )}

                {!isLoading && filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {shopId || searchQuery ? 'Tidak ada menu yang ditemukan.' : 'Tidak ada kantin yang ditemukan.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
