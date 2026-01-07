import {
    ChevronLeft,
    Minus,
    Package,
    Plus,
    Share2,
    ShoppingCart,
    Star,
    Store,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
    const [showImagePopup, setShowImagePopup] = useState(false);
    
    // Drag handle state
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const contentCardRef = useRef<HTMLDivElement>(null);

    // Handle drag start
    const handleDragStart = useCallback((clientY: number) => {
        setIsDragging(true);
        dragStartY.current = clientY;
    }, []);

    // Handle drag move
    const handleDragMove = useCallback((clientY: number) => {
        if (!isDragging) return;
        const delta = clientY - dragStartY.current;
        // Only allow dragging down (positive delta)
        if (delta > 0) {
            setDragOffset(Math.min(delta, 150));
        }
    }, [isDragging]);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        if (dragOffset > 80) {
            // Threshold reached, show popup
            setShowImagePopup(true);
        }
        setDragOffset(0);
        setIsDragging(false);
    }, [dragOffset]);

    // Touch event handlers
    const onTouchStart = (e: React.TouchEvent) => {
        handleDragStart(e.touches[0].clientY);
    };
    
    const onTouchMove = (e: React.TouchEvent) => {
        handleDragMove(e.touches[0].clientY);
    };
    
    const onTouchEnd = () => {
        handleDragEnd();
    };

    // Mouse event handlers (for desktop testing)
    const onMouseDown = (e: React.MouseEvent) => {
        handleDragStart(e.clientY);
    };

    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    // Add global mouse event listeners for drag
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            handleDragMove(e.clientY);
        };
        
        const handleMouseUp = () => {
            handleDragEnd();
        };
        
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

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
            {/* Image Popup Modal */}
            {showImagePopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setShowImagePopup(false)}
                >
                    <button
                        onClick={() => setShowImagePopup(false)}
                        className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white transition-all hover:bg-white/30"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <img
                        src={
                            menu.image_url ||
                            'https://placehold.co/600x600?text=No+Image'
                        }
                        alt={menu.name}
                        className="max-h-[90vh] max-w-full rounded-lg object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Mobile Layout */}
            <div className="pb-32 md:hidden">
                {/* Hero Image */}
                <div className="relative h-72 w-full">
                    <img
                        src={
                            menu.image_url ||
                            'https://placehold.co/600x600?text=No+Image'
                        }
                        alt={menu.name}
                        className="h-full w-full cursor-pointer object-cover"
                        onClick={() => setShowImagePopup(true)}
                    />

                    {/* Back Button Only */}
                    <div className="absolute top-0 left-0 z-10 p-4 pt-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="rounded-full border border-white/10 bg-black/30 p-2 text-white shadow-lg backdrop-blur-md transition-all hover:bg-black/40 active:scale-95"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Content Card */}
                <div 
                    ref={contentCardRef}
                    className="relative -mt-6 min-h-[50vh] overflow-hidden rounded-t-3xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.1)]"
                    style={{
                        transform: `translateY(${dragOffset}px)`,
                        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                    }}
                >
                    {/* Draggable Handle */}
                    <div 
                        className="flex flex-col items-center justify-center py-3 active:cursor-grabbing"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                        onMouseDown={onMouseDown}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    >
                        <div className={`h-1.5 w-12 rounded-full transition-all ${isDragging ? 'w-16 bg-blue-400' : 'bg-gray-300'}`} />
                        {/* Pull indicator - inside handle div */}
                        {dragOffset > 20 && (
                            <p 
                                className="mt-2 text-center text-xs text-gray-400"
                                style={{ opacity: Math.min(dragOffset / 80, 1) }}
                            >
                                {dragOffset > 80 ? '↓ Lepaskan' : '↓ Tarik'}
                            </p>
                        )}
                    </div>

                    <div className="p-6">
                        {/* Category Badge & Menu Name */}
                        <div className="mb-4">
                            <div className="mb-2 flex items-start justify-between">
                                <div className="flex-1">
                                    {menu.category && (
                                        <span className="mb-2 inline-block rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold tracking-wide text-white uppercase">
                                            {menu.category.name}
                                        </span>
                                    )}
                                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                                        {menu.name}
                                    </h1>
                                </div>
                                {/* Share & Like Buttons */}
                                <div className="flex shrink-0 gap-2">
                                    <button className="rounded-full border border-gray-200 bg-gray-50 p-2.5 text-gray-500 transition-all hover:bg-gray-100 active:scale-95">
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                    <LikeButton
                                        menuId={menu.id}
                                        initialLikesCount={menu.likes_count}
                                        variant="desktop"
                                    />
                                </div>
                            </div>
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-sm font-medium ${
                                    isOutOfStock
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                }`}
                            >
                                <div
                                    className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}
                                />
                                {isOutOfStock
                                    ? 'Stok Habis'
                                    : `Tersedia: ${menu.stock}`}
                            </span>
                        </div>

                        {/* Price & Rating */}
                        <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-6">
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
                            className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                                isOutOfStock
                                    ? 'cursor-not-allowed bg-gray-300 shadow-none'
                                    : 'bg-blue-600 shadow-blue-500/30 hover:bg-blue-700'
                            }`}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            <span>Tambah</span>
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
                                className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                onClick={() => setShowImagePopup(true)}
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
                                            <span>Tambah ke Keranjang</span>
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
