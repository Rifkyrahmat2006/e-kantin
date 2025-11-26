import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { formatRupiah } from '../../utils/formatRupiah';

interface Menu {
    id: number;
    name: string;
    description: string;
    price: number;
    menu_category_id: number;
    image?: string;
    status: string;
    stock: number;
    category?: {
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
                image: menu.image
            });
            navigate('/cart');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center">
                <p className="text-red-500">{error || 'Menu not found'}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <Link to="/menu" className="mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="mr-1 h-5 w-5" />
                    Back to Menu
                </Link>

                <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                    {/* Image gallery */}
                    <div className="flex flex-col-reverse">
                        <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100 sm:aspect-h-2 sm:aspect-w-3">
                            <div className="flex h-full items-center justify-center bg-gray-200 text-gray-500">
                                <span className="text-4xl">No Image</span>
                            </div>
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{menu.name}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl tracking-tight text-gray-900">{formatRupiah(menu.price)}</p>
                        </div>

                        <div className="mt-3">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${menu.status === 'available' && menu.stock > 0
                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                    : 'bg-red-50 text-red-700 ring-red-600/20'
                                }`}>
                                {menu.status === 'available' && menu.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">({menu.stock} available)</span>
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="space-y-6 text-base text-gray-700">
                                <p>{menu.description}</p>
                            </div>
                        </div>

                        <div className="mt-10">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-gray-700">Quantity</span>
                                <div className="flex items-center rounded-md border border-gray-300">
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(-1)}
                                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-12 text-center text-gray-900">{quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleQuantityChange(1)}
                                        className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                        disabled={quantity >= menu.stock}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={menu.status !== 'available' || menu.stock === 0}
                                className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
