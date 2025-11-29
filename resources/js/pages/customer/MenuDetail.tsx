import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import { ChevronLeft, Minus, Plus, ShoppingCart, Store } from 'lucide-react';
import { formatRupiah } from '../../utils/formatRupiah';

interface Menu {
    id: number;
    name: string;
    description: string;
    price: number;
    menu_category_id: number;
    image_url: string | null;
    status: string;
    stock: number;
    shop_id: number;
    category?: {
        id: number;
        name: string;
    };
    shop?: {
        id: number;
        name: string;
    };
}

export default function MenuDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [menu, setMenu] = useState<Menu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get(`/menus/${id}`);
                setMenu(response.data.menu);
            } catch (err) {
                setError('Failed to load menu details.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMenu();
        }
    }, [id]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => {
            const newQuantity = prev + delta;
            if (newQuantity < 1) return 1;
            if (menu && newQuantity > menu.stock) return menu.stock;
            return newQuantity;
        });
    };

    const handleAddToCart = () => {
        if (menu) {
            addToCart({
                id: menu.id,
                name: menu.name,
                price: Number(menu.price),
                quantity: quantity,
                image: menu.image_url || undefined,
                shop_id: menu.shop_id
            });
            navigate('/cart');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-center">
                <p className="text-red-500 mb-4">{error || 'Menu not found'}</p>
                <button onClick={() => navigate(-1)} className="text-blue-600 font-medium hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white md:h-screen md:overflow-hidden">
            <div className="grid md:grid-cols-2 h-full">
                {/* Left Side: Image */}
                <div className="relative h-72 md:h-full w-full bg-gray-200">
                    <img
                        src={menu.image_url || 'https://placehold.co/600x600?text=No+Image'}
                        alt={menu.name}
                        className="h-full w-full object-cover"
                    />
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 rounded-full bg-white/80 p-2 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6 text-gray-900" />
                    </button>
                </div>

                {/* Right Side: Content */}
                <div className="flex flex-col h-full md:overflow-y-auto relative bg-white -mt-6 md:mt-0 rounded-t-3xl md:rounded-none shadow-lg md:shadow-none">
                    <div className="flex-1 p-6 md:p-8 lg:p-12">
                        <div className="mb-8">
                            <div className="flex items-start justify-between mb-2">
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{menu.name}</h1>
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${menu.status === 'available' && menu.stock > 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {menu.status === 'available' && menu.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-blue-600">{formatRupiah(menu.price)}</p>
                        </div>

                        {/* Shop Info */}
                        <div className="mb-8 flex items-center space-x-4 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Store className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Sold by</p>
                                <p className="text-base font-semibold text-gray-900">Kantin Teknik</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                            <p className="text-base leading-relaxed text-gray-600 whitespace-pre-line">
                                {menu.description}
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-gray-200 bg-white p-4 md:p-8 sticky bottom-0 z-10">
                        <div className="flex items-center gap-4 max-w-xl mx-auto md:mx-0">
                            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(-1)}
                                    className="p-3 md:p-4 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-5 w-5" />
                                </button>
                                <span className="w-12 text-center font-bold text-lg text-gray-900">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => handleQuantityChange(1)}
                                    className="p-3 md:p-4 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
                                    disabled={quantity >= menu.stock}
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={menu.status !== 'available' || menu.stock === 0}
                                className="flex-1 flex items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-base md:text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] transition-all"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
