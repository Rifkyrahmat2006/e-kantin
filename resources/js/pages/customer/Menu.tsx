import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useCart } from '../../contexts/CartContext';
import MenuCard from '../../components/MenuCard';

interface Category {
    id: number;
    name: string;
}

interface Menu {
    id: number;
    name: string;
    description: string;
    price: number;
    menu_category_id: number;
    image?: string;
    status: string;
}

export default function Menu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, menusRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/menus')
                ]);
                setCategories(categoriesRes.data.categories);
                setMenus(menusRes.data.menus);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredMenus = selectedCategory
        ? menus.filter(menu => menu.menu_category_id === selectedCategory)
        : menus;

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Our Menu</h2>

                {/* Category Filter */}
                <div className="mt-6 flex space-x-4 overflow-x-auto pb-4">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === category.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {filteredMenus.map((menu) => (
                        <MenuCard key={menu.id} menu={menu} />
                    ))}
                </div>
            </div>
        </div>
    );
}
