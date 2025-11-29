import { useCart, CartItem as CartItemType } from '../contexts/CartContext';
import { formatRupiah } from '../utils/formatRupiah';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <li className="flex py-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
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

            <div className="ml-4 flex flex-1 flex-col justify-between">
                <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3 className="line-clamp-1">{item.name}</h3>
                        <p className="ml-4">{formatRupiah(item.price * item.quantity)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{formatRupiah(item.price)} / item</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center text-red-500 hover:text-red-600"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Remove</span>
                    </button>
                </div>
            </div>
        </li>
    );
}
