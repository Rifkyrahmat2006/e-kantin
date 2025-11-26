import { useCart, CartItem as CartItemType } from '../contexts/CartContext';
import { formatRupiah } from '../utils/formatRupiah';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeFromCart } = useCart();

    return (
        <li className="flex py-6">
            <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-md bg-gray-100 object-cover object-center sm:h-32 sm:w-32 flex items-center justify-center text-gray-400">
                    No Image
                </div>
            </div>

            <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                <div>
                    <div className="flex justify-between">
                        <h4 className="text-sm">
                            <a href="#" className="font-medium text-gray-700 hover:text-gray-800">
                                {item.name}
                            </a>
                        </h4>
                        <p className="ml-4 text-sm font-medium text-gray-900">
                            {formatRupiah(item.price * item.quantity)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex flex-1 items-end justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="rounded-md border border-gray-300 p-1 hover:bg-gray-50"
                        >
                            -
                        </button>
                        <span className="text-sm text-gray-500">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="rounded-md border border-gray-300 p-1 hover:bg-gray-50"
                        >
                            +
                        </button>
                    </div>
                    <div className="ml-4">
                        <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            <span>Remove</span>
                        </button>
                    </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatRupiah(item.price)} each</p>
            </div>
        </li>
    );
}
