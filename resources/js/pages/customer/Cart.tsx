import { Link, useNavigate } from 'react-router-dom';
import { useCart, CartItem as CartItemType } from '../../contexts/CartContext';
import CartItem from '../../components/CartItem';
import { formatRupiah } from '../../utils/formatRupiah';
import { ArrowRight, ShoppingBag, ChevronLeft, Store, Check } from 'lucide-react';
import { useMemo } from 'react';

interface TenantGroup {
    shopId: number;
    shopName: string;
    items: CartItemType[];
}

export default function Cart() {
    const { 
        items, 
        selectedTotalPrice, 
        selectedItemsCount,
        toggleItemSelection,
        toggleTenantSelection,
        selectAll,
        deselectAll,
        isItemSelected,
        isTenantFullySelected,
        isTenantPartiallySelected
    } = useCart();
    const navigate = useNavigate();

    // Group items by tenant
    const tenantGroups = useMemo(() => {
        const groups: Map<number, TenantGroup> = new Map();
        
        items.forEach(item => {
            const shopId = item.shop_id;
            if (!groups.has(shopId)) {
                groups.set(shopId, {
                    shopId,
                    shopName: item.shop_name || 'Tenant',
                    items: []
                });
            }
            groups.get(shopId)!.items.push(item);
        });

        return Array.from(groups.values());
    }, [items]);

    // Check if all items are selected
    const allSelected = items.length > 0 && items.every(item => isItemSelected(item.id));
    const someSelected = items.some(item => isItemSelected(item.id));

    const handleSelectAll = () => {
        if (allSelected) {
            deselectAll();
        } else {
            selectAll();
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-4">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-inner">
                    <ShoppingBag className="h-14 w-14 text-blue-500" />
                </div>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">Keranjang Kosong</h2>
                <p className="mt-2 text-center text-gray-500">Sepertinya Anda belum memesan apapun.</p>
                <Link
                    to="/menu"
                    className="mt-8 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
                >
                    Mulai Pesan
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-gray-100 to-gray-50 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg px-4 py-4 shadow-sm border-b border-gray-100 flex items-center max-w-7xl mx-auto w-full md:rounded-b-2xl md:mt-4 md:px-6">
                <button onClick={() => navigate(-1)} className="mr-3 p-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Keranjang Saya</h1>
                    <p className="text-xs text-gray-500">{items.length} item dari {tenantGroups.length} toko</p>
                </div>
            </div>

            <div className="mx-auto max-w-2xl px-4 py-6 md:max-w-4xl space-y-4 mb-52 md:mb-40">


                {/* Tenant Groups */}
                {tenantGroups.map((group) => {
                    const isFullySelected = isTenantFullySelected(group.shopId);
                    const isPartiallySelected = isTenantPartiallySelected(group.shopId);

                    return (
                        <div key={group.shopId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Tenant Header */}
                            <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                                <label className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50/80 transition-colors">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            checked={isFullySelected}
                                            ref={(el) => {
                                                if (el) {
                                                    el.indeterminate = isPartiallySelected;
                                                }
                                            }}
                                            onChange={() => toggleTenantSelection(group.shopId)}
                                            className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="ml-3 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                                            <Store className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{group.shopName}</h3>
                                            <p className="text-xs text-gray-500">{group.items.length} item</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            {/* Items */}
                            <ul className="divide-y divide-gray-100">
                                {group.items.map((item) => (
                                    <CartItem 
                                        key={item.id} 
                                        item={item}
                                        isSelected={isItemSelected(item.id)}
                                        onSelectChange={() => toggleItemSelection(item.id)}
                                    />
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Fixed Bottom Summary */}
            <div className="fixed bottom-16 left-0 right-0 z-40 md:bottom-0">
                <div className="max-w-md mx-auto md:max-w-4xl">
                    {/* Gradient overlay on top */}
                    <div className="h-6 bg-gradient-to-t from-white to-transparent md:hidden"></div>
                    
                    <div className="bg-white border-t border-gray-200 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.15)] rounded-t-3xl md:rounded-2xl md:shadow-lg md:border md:mb-4 md:mx-4">
                        <div className="p-4">
                            {/* Summary Row */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">Total</span>
                                    <span className="text-xl font-bold text-gray-900">{formatRupiah(selectedTotalPrice)}</span>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                    {selectedItemsCount} item
                                </span>
                            </div>
                            
                            {/* Select All + Checkout Row */}
                            <div className="flex items-center gap-3">
                                {/* Select All Checkbox */}
                                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        onChange={handleSelectAll}
                                        className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Semua</span>
                                </label>

                                {/* Checkout Button */}
                                <Link
                                    to={selectedItemsCount > 0 ? "/checkout" : "#"}
                                    onClick={(e) => {
                                        if (selectedItemsCount === 0) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`flex flex-1 items-center justify-center rounded-xl px-4 py-3 text-base font-bold shadow-md transition-all duration-300 ${
                                        selectedItemsCount > 0
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98]'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    {selectedItemsCount > 0 ? (
                                        <>
                                            Checkout
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </>
                                    ) : (
                                        'Pilih item'
                                    )}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
