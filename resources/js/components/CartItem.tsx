import { useCart, CartItem as CartItemType } from '../contexts/CartContext';
import { formatRupiah } from '../utils/formatRupiah';
import { Minus, Plus, Trash2, AlertCircle } from 'lucide-react';

interface CartItemProps {
    item: CartItemType;
    isSelected: boolean;
    onSelectChange: () => void;
}

export default function CartItem({ item, isSelected, onSelectChange }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();
    
    // Check if item is out of stock or quantity exceeds stock
    const isOutOfStock = item.stock !== undefined && item.stock <= 0;
    const exceedsStock = item.stock !== undefined && item.quantity > item.stock;
    const hasStockIssue = isOutOfStock || exceedsStock;

    return (
        <li className={`flex items-start gap-3 py-4 px-4 transition-colors ${hasStockIssue ? 'bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
            {/* Checkbox */}
            <div className="flex items-center pt-1">
                <input
                    type="checkbox"
                    checked={isSelected && !hasStockIssue}
                    onChange={onSelectChange}
                    disabled={hasStockIssue}
                    className={`h-5 w-5 rounded-md border-gray-300 focus:ring-offset-0 cursor-pointer transition-all ${
                        hasStockIssue 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-blue-600 focus:ring-blue-500'
                    }`}
                />
            </div>

            {/* Image */}
            <div className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 ${hasStockIssue ? 'opacity-50' : ''}`}>
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        <span className="text-xs">No Img</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`flex flex-1 flex-col justify-between min-w-0 ${hasStockIssue ? 'opacity-75' : ''}`}>
                <div>
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</h3>
                        <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{formatRupiah(item.price)} / item</p>
                    
                    {/* Stock Warning */}
                    {isOutOfStock && (
                        <div className="flex items-center gap-1 mt-1.5 text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Stok Habis</span>
                        </div>
                    )}
                    {exceedsStock && !isOutOfStock && (
                        <div className="flex items-center gap-1 mt-1.5 text-orange-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Stok tersisa: {item.stock}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mt-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded-xl border border-gray-200 bg-white shadow-sm">
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-xl transition-colors"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                            className={`p-2 rounded-r-xl transition-colors ${
                                item.stock !== undefined && item.quantity >= item.stock
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Remove Button */}
                    <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs font-medium hidden sm:inline">Hapus</span>
                    </button>
                </div>
            </div>
        </li>
    );
}
