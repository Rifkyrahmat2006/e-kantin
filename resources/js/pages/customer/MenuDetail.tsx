import {
    ChevronLeft,
    Minus,
    Package,
    Plus,
    Share2,
    ShoppingCart,
    Star,
    Store,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LikeButton from '../../components/LikeButton';
import ReviewSection from '../../components/ReviewSection';
import { useCart } from '../../contexts/CartContext';
import api from '../../lib/api';
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
    average_rating: number;
    reviews_count: number;
    likes_count: number;
    total_sold: number;
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
        setQuantity((prev) => {
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
                shop_name: menu.shop?.name,
            });
            // Reset state after adding - don't navigate to cart
            setTimeout(() => {
                setIsAdding(false);
                setQuantity(1); // Reset quantity to 1
            }, 300);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500">Memuat detail menu...</p>
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <Package className="h-8 w-8 text-red-500" />
                </div>
                <p className="mb-2 font-medium text-gray-900">
                    {error || 'Menu tidak ditemukan'}
                </p>
                <button
                    onClick={() => navigate(-1)}
                    className="font-medium text-blue-600 hover:underline"
                >
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
            <div className="pb-32 md:hidden">
                {/* Hero Image */}
                <div className="relative h-96 w-full">
                    <img
                        src={
                            menu.image_url ||
                            'https://placehold.co/600x600?text=No+Image'
                        }
                        alt={menu.name}
                        className="h-full w-full object-cover"
                    />
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                    {/* Top Actions */}
                    <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between p-4 pt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-full border border-white/10 bg-white/20 p-2 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <div className="flex gap-3">
                            <button className="rounded-full border border-white/10 bg-white/20 p-2 text-white shadow-lg backdrop-blur-md transition-all hover:bg-white/30 active:scale-95">
                                <Share2 className="h-5 w-5" />
                            </button>
                            <LikeButton
                                menuId={menu.id}
                                initialLikesCount={menu.likes_count}
                            />
                        </div>
                    </div>

                    {/* Badge & Info Overlay on Image */}
                    <div className="absolute right-0 bottom-10 left-0 z-10 p-5 text-white">
                        {menu.category && (
                            <span className="mb-3 inline-block rounded-lg bg-blue-600/90 px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm backdrop-blur-sm">
                                {menu.category.name}
                            </span>
                        )}
                        <h1 className="mb-2 text-3xl leading-tight font-extrabold tracking-tight drop-shadow-md">
                            {menu.name}
                        </h1>
                        <div className="flex items-center gap-3 text-sm font-medium text-white/90">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 ${
                                    isOutOfStock
                                        ? 'bg-red-500/20 text-red-200'
                                        : 'bg-green-500/20 text-green-200'
                                }`}
                            >
                                <div
                                    className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-red-400' : 'bg-green-400'}`}
                                />
                                {isOutOfStock
                                    ? 'Stok Habis'
                                    : `Tersedia: ${menu.stock}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Card */}
                <div className="relative -mt-6 min-h-[50vh] overflow-hidden rounded-t-3xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
                    <div className="mx-auto mt-3 mb-1 h-1.5 w-12 rounded-full bg-gray-200" />

                    <div className="p-6">
                        {/* Price & Rating Placeholder */}
                        <div className="mb-8 flex items-end justify-between border-b border-gray-100 pb-6">
                            <div>
                                <p className="mb-1 text-sm font-medium text-gray-500">
                                    Harga Satuan
                                </p>
                                <p className="text-3xl font-bold tracking-tight text-blue-600">
                                    {formatRupiah(menu.price)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="mb-1 flex items-center gap-1 text-amber-400">
                                    <Star className="h-5 w-5 fill-amber-400" />
                                    <span className="text-lg font-bold text-gray-700">
                                        {menu.average_rating || '0'}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-gray-400">
                                    ({menu.reviews_count} ulasan)
                                </span>
                            </div>
                        </div>

                        {/* Shop Info Card */}
                        <button
                            onClick={() =>
                                navigate(`/menu?shop_id=${menu.shop_id}`)
                            }
                            className="group mb-8 flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all active:scale-[0.99]"
                        >
                            <div className="relative shrink-0">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-100 bg-white text-blue-600 shadow-sm">
                                    <Store className="h-7 w-7" />
                                </div>
                                <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white bg-green-500"></div>
                            </div>
                            <div className="flex-1 text-left">
                                <p className="mb-0.5 text-xs font-medium text-slate-500">
                                    Dijual oleh
                                </p>
                                <h4 className="text-base font-bold text-slate-800 transition-colors group-hover:text-blue-600">
                                    {menu.shop?.name || 'Kantin Teknik'}
                                </h4>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Sedang Buka • 1.2km
                                </p>
                            </div>
                            <ChevronLeft className="h-5 w-5 rotate-180 text-slate-300 transition-colors group-hover:text-blue-500" />
                        </button>

                        {/* Description */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900">
                                Deskripsi Menu
                            </h3>
                            <p className="text-base leading-relaxed whitespace-pre-line text-slate-600">
                                {menu.description ||
                                    'Nikmati kelezatan menu spesial kami ini. Dibuat dengan bahan-bahan pilihan dan resep terbaik untuk kepuasan Anda.'}
                            </p>
                        </div>

                        {/* Reviews Section */}
                        <div className="mt-8 border-t border-gray-100 pt-6">
                            <ReviewSection menuId={menu.id} />
                        </div>
                    </div>
                </div>

                {/* Fixed Bottom Bar - Floating style above nav */}
                <div className="fixed right-4 bottom-20 left-4 z-30">
                    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
                        {/* Quantity Selector */}
                        <div className="flex h-12 items-center rounded-xl border border-gray-100 bg-gray-50 px-1">
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(-1)}
                                className="flex h-full w-9 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 active:text-blue-600 disabled:opacity-30"
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4 stroke-[2.5]" />
                            </button>
                            <span className="min-w-[1.5rem] text-center text-base font-bold text-gray-900">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleQuantityChange(1)}
                                className="flex h-full w-9 items-center justify-center text-gray-500 transition-colors hover:text-gray-900 active:text-blue-600 disabled:opacity-30"
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
                            className={`flex h-12 flex-1 items-center justify-between rounded-xl px-5 font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                                isOutOfStock
                                    ? 'cursor-not-allowed bg-gray-300 shadow-none'
                                    : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 fill-white/20" />
                                <span className="text-sm">Tambah</span>
                            </div>
                            <span className="text-base">
                                {formatRupiah(totalPrice)}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden min-h-screen md:block">
                <div className="mx-auto max-w-6xl p-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="font-medium">Kembali</span>
                    </button>

                    <div className="grid grid-cols-2 gap-12">
                        {/* Left: Image */}
                        <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100 shadow-2xl">
                            <img
                                src={
                                    menu.image_url ||
                                    'https://placehold.co/600x600?text=No+Image'
                                }
                                alt={menu.name}
                                className="h-full w-full object-cover"
                            />
                            {menu.category && (
                                <div className="absolute top-4 left-4">
                                    <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-sm">
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
                                    <div className="mb-3 flex items-start gap-4">
                                        <h1 className="flex-1 text-3xl font-bold text-gray-900 lg:text-4xl">
                                            {menu.name}
                                        </h1>
                                        <span
                                            className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-semibold ${
                                                isOutOfStock
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-green-100 text-green-700'
                                            }`}
                                        >
                                            {isOutOfStock
                                                ? 'Stok Habis'
                                                : `Stok: ${menu.stock}`}
                                        </span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600 lg:text-4xl">
                                        {formatRupiah(menu.price)}
                                    </p>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                            <span className="font-bold text-gray-900">
                                                {menu.average_rating || '0'}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ({menu.reviews_count} ulasan)
                                            </span>
                                        </div>
                                        <LikeButton
                                            menuId={menu.id}
                                            initialLikesCount={menu.likes_count}
                                            variant="desktop"
                                        />
                                    </div>
                                </div>

                                {/* Shop Info */}
                                <button
                                    onClick={() =>
                                        navigate(
                                            `/menu?shop_id=${menu.shop_id}`,
                                        )
                                    }
                                    className="group mb-6 flex w-full items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <Store className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500">
                                            Dijual oleh
                                        </p>
                                        <p className="text-base font-semibold text-blue-600 group-hover:underline">
                                            {menu.shop?.name || 'Kantin Teknik'}
                                        </p>
                                    </div>
                                    <ChevronLeft className="h-5 w-5 rotate-180 text-gray-400" />
                                </button>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="mb-3 text-lg font-bold text-gray-900">
                                        Deskripsi
                                    </h3>
                                    <p className="text-base leading-relaxed whitespace-pre-line text-gray-600">
                                        {menu.description ||
                                            'Tidak ada deskripsi untuk menu ini.'}
                                    </p>
                                </div>

                                {/* Actions - Add to Cart */}
                                <div className="border-t border-gray-200 pt-6">
                                    <div className="flex items-center gap-4">
                                        {/* Quantity */}
                                        <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleQuantityChange(-1)
                                                }
                                                className="p-4 text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-40"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="h-5 w-5" />
                                            </button>
                                            <span className="w-12 text-center text-lg font-bold text-gray-900">
                                                {quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleQuantityChange(1)
                                                }
                                                className="p-4 text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-40"
                                                disabled={
                                                    quantity >= menu.stock
                                                }
                                            >
                                                <Plus className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Add to Cart */}
                                        <button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={isOutOfStock || isAdding}
                                            className={`flex flex-1 items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                                                isOutOfStock
                                                    ? 'cursor-not-allowed bg-gray-300 shadow-none'
                                                    : 'bg-blue-600 shadow-blue-200 hover:bg-blue-700'
                                            }`}
                                        >
                                            <ShoppingCart className="h-6 w-6" />
                                            <span>
                                                Tambah ke Keranjang -{' '}
                                                {formatRupiah(totalPrice)}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section - Full Width Centered Below */}
                    <div className="mx-auto mt-12 max-w-3xl">
                        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                            <ReviewSection menuId={menu.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
