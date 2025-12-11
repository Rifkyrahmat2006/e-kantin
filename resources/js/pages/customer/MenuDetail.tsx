import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
import { ChevronLeft, Minus, Plus, ShoppingCart, Store, Package, Heart, Share2 } from 'lucide-react';
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
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get(`/menus/${id}`);
                setMenu(response.data.menu);
            } catch (err) {
                setError('Gagal memuat detail menu.');
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
            setIsAdding(true);
            addToCart({
                id: menu.id,
                name: menu.name,
                price: Number(menu.price),
                quantity: quantity,
                image: menu.image_url || undefined,
                shop_id: menu.shop_id,
                shop_name: menu.shop?.name
            });
            setTimeout(() => {
                navigate('/cart');
            }, 300);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-gray-500">Memuat detail menu...</p>
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-gray-900 font-medium mb-2">{error || 'Menu tidak ditemukan'}</p>
                <button onClick={() => navigate(-1)} className="text-blue-600 font-medium hover:underline">
                    Kembali
                </button>
            </div>
        );
    }

    const isOutOfStock = menu.status !== 'available' || menu.stock === 0;
    const totalPrice = menu.price * quantity;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Layout */}
            <div className="md:hidden pb-32">
                {/* Hero Image */}
                <div className="relative h-96 w-full">
                    <img
                        src={menu.image_url || 'https://placehold.co/600x600?text=No+Image'}
                        alt={menu.name}
                        className="h-full w-full object-cover"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {/* Top Actions */}
                    <div className="absolute top-0 left-0 right-0 p-4 pt-6 flex justify-between items-center z-10">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-full bg-white/20 p-2 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/30 transition-all active:scale-95 text-white"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <div className="flex gap-3">
                            <button className="rounded-full bg-white/20 p-2 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/30 transition-all active:scale-95 text-white">
                                <Share2 className="h-5 w-5" />
                            </button>
                            <button className="rounded-full bg-white/20 p-2 backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/30 transition-all active:scale-95 text-white">
                                <Heart className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Badge & Info Overlay on Image */}
                    <div className="absolute bottom-10 left-0 right-0 p-5 text-white z-10">
                        {menu.category && (
                            <span className="inline-block px-3 py-1 mb-3 bg-blue-600/90 backdrop-blur-sm rounded-lg text-xs font-bold tracking-wide uppercase shadow-sm">
                                {menu.category.name}
                            </span>
                        )}
                        <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-2 drop-shadow-md">
                            {menu.name}
                        </h1>
                        <div className="flex items-center gap-3 text-white/90 font-medium text-sm">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md ${
                                isOutOfStock ? 'bg-red-500/20 text-red-200' : 'bg-green-500/20 text-green-200'
                            }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-green-400'}`} />
                                {isOutOfStock ? 'Stok Habis' : `Tersedia: ${menu.stock}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="relative -mt-6 bg-white rounded-t-3xl min-h-[50vh] shadow-[0_-4px_24px_rgba(0,0,0,0.1)] overflow-hidden">
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />
                    
                    <div className="p-6">
                        {/* Price & Rating Placeholder */}
                        <div className="flex items-end justify-between mb-8 border-b border-gray-100 pb-6">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">Harga Satuan</p>
                                <p className="text-3xl font-bold text-blue-600 tracking-tight">{formatRupiah(menu.price)}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-amber-400 mb-1">
                                    <div className="fill-current">★</div>
                                    <span className="text-gray-700 font-bold text-lg">4.8</span>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">(120+ Terjual)</span>
                            </div>
                        </div>

                        {/* Shop Info Card */}
                        <button 
                            onClick={() => navigate(`/menu?shop_id=${menu.shop_id}`)}
                            className="w-full mb-8 flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 active:scale-[0.99] transition-all group"
                        >
                            <div className="relative shrink-0">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 text-blue-600">
                                    <Store className="h-7 w-7" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-green-500 h-4 w-4 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-xs text-slate-500 font-medium mb-0.5">Dijual oleh</p>
                                <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                    {menu.shop?.name || 'Kantin Teknik'}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">Sedang Buka • 1.2km</p>
                            </div>
                            <ChevronLeft className="h-5 w-5 text-slate-300 rotate-180 group-hover:text-blue-500 transition-colors" />
                        </button>

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900">Deskripsi Menu</h3>
                            <p className="text-base leading-relaxed text-slate-600 whitespace-pre-line">
                                {menu.description || 'Nikmati kelezatan menu spesial kami ini. Dibuat dengan bahan-bahan pilihan dan resep terbaik untuk kepuasan Anda.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom Bar - Floating style above nav */}
                <div className="fixed bottom-20 left-4 right-4 z-30">
                    <div className="bg-white rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 flex gap-3 items-center">
                        {/* Quantity Selector */}
                        <div className="flex items-center bg-gray-50 rounded-xl px-1 h-12 border border-gray-100">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(-1)}
                                className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 active:text-blue-600 disabled:opacity-30 transition-colors"
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4 stroke-[2.5]" />
                            </button>
                            <span className="min-w-[1.5rem] text-center font-bold text-gray-900 text-base">{quantity}</span>
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(1)}
                                className="w-9 h-full flex items-center justify-center text-gray-500 hover:text-gray-900 active:text-blue-600 disabled:opacity-30 transition-colors"
                                disabled={quantity >= menu.stock}
                            >
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                            </button>
                        </div>

                        {/* Order Button */}
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={isOutOfStock || isAdding}
                            className={`flex-1 h-12 rounded-xl flex items-center justify-between px-5 font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                                isOutOfStock 
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                    : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 fill-white/20" />
                                <span className="text-sm">Tambah</span>
                            </div>
                            <span className="text-base">{formatRupiah(totalPrice)}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block min-h-screen">
                <div className="max-w-6xl mx-auto p-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="font-medium">Kembali</span>
                    </button>

                    <div className="grid grid-cols-2 gap-12">
                        {/* Left: Image */}
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 shadow-2xl">
                            <img
                                src={menu.image_url || 'https://placehold.co/600x600?text=No+Image'}
                                alt={menu.name}
                                className="h-full w-full object-cover"
                            />
                            {menu.category && (
                                <div className="absolute top-4 left-4">
                                    <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800 shadow-sm">
                                        {menu.category.name}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right: Details */}
                        <div className="flex flex-col">
                            <div className="flex-1">
                                {/* Title & Status */}
                                <div className="mb-4">
                                    <div className="flex items-start gap-4 mb-3">
                                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 flex-1">{menu.name}</h1>
                                        <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${
                                            isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {isOutOfStock ? 'Stok Habis' : `Stok: ${menu.stock}`}
                                        </span>
                                    </div>
                                    <p className="text-3xl lg:text-4xl font-bold text-blue-600">{formatRupiah(menu.price)}</p>
                                </div>

                                {/* Shop Info */}
                                <button 
                                    onClick={() => navigate(`/menu?shop_id=${menu.shop_id}`)}
                                    className="mb-6 flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 w-full text-left hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <Store className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">Dijual oleh</p>
                                        <p className="text-base font-semibold text-blue-600 group-hover:underline">{menu.shop?.name || 'Kantin Teknik'}</p>
                                    </div>
                                    <ChevronLeft className="h-5 w-5 text-gray-400 rotate-180" />
                                </button>

                                {/* Description */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi</h3>
                                    <p className="text-base leading-relaxed text-gray-600 whitespace-pre-line">
                                        {menu.description || 'Tidak ada deskripsi untuk menu ini.'}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-gray-200 pt-6">
                                <div className="flex items-center gap-4">
                                    {/* Quantity */}
                                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(-1)}
                                            className="p-4 text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="h-5 w-5" />
                                        </button>
                                        <span className="w-12 text-center font-bold text-lg text-gray-900">{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleQuantityChange(1)}
                                            className="p-4 text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors"
                                            disabled={quantity >= menu.stock}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Add to Cart */}
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock || isAdding}
                                        className={`flex-1 flex items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                                            isOutOfStock 
                                                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                                : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                                        }`}
                                    >
                                        <ShoppingCart className="h-6 w-6" />
                                        <span>Tambah ke Keranjang - {formatRupiah(totalPrice)}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
