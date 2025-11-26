import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../lib/api';

export interface CartItem {
    id: number; // Menu ID
    name: string;
    price: number;
    quantity: number;
    image?: string;
    shop_id: number;
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const { isAuthenticated } = useAuth();

    // Load cart from local storage or API
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                try {
                    const response = await api.get('/cart');
                    setItems(response.data.items);
                } catch (error) {
                    console.error('Failed to fetch cart from server:', error);
                }
            } else {
                const storedCart = localStorage.getItem('cart_items');
                if (storedCart) {
                    try {
                        setItems(JSON.parse(storedCart));
                    } catch (e) {
                        console.error('Failed to parse cart items', e);
                    }
                } else {
                    setItems([]);
                }
            }
        };

        loadCart();
    }, [isAuthenticated]);

    // Save cart to local storage whenever it changes (only if not authenticated)
    useEffect(() => {
        if (!isAuthenticated) {
            localStorage.setItem('cart_items', JSON.stringify(items));
        }
    }, [items, isAuthenticated]);

    const addToCart = async (newItem: CartItem) => {
        // Check if item belongs to the same shop as existing items
        if (items.length > 0 && items[0].shop_id !== newItem.shop_id) {
            if (!window.confirm('You can only order from one shop at a time. Clear cart and add this item?')) {
                return;
            }
            await clearCart();
            // We need to wait for state update or manually pass empty array to next step.
            // For simplicity, we'll just proceed assuming clearCart works or we force it.
            setItems([]); // Force clear locally first
        }

        // Optimistic update
        setItems(prevItems => {
            // Double check shop_id (though we cleared it above if needed)
            if (prevItems.length > 0 && prevItems[0].shop_id !== newItem.shop_id) {
                return [newItem]; // Should have been handled, but safety net
            }

            const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += newItem.quantity;
                return updatedItems;
            } else {
                return [...prevItems, newItem];
            }
        });

        if (isAuthenticated) {
            try {
                await api.post('/cart', {
                    menu_id: newItem.id,
                    quantity: newItem.quantity
                });
            } catch (error) {
                console.error('Failed to add item to server cart:', error);
            }
        }
    };

    const removeFromCart = async (itemId: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));

        if (isAuthenticated) {
            try {
                await api.delete(`/cart/${itemId}`);
            } catch (error) {
                console.error('Failed to remove item from server cart:', error);
            }
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );

        if (isAuthenticated) {
            try {
                await api.put(`/cart/${itemId}`, { quantity });
            } catch (error) {
                console.error('Failed to update item quantity on server:', error);
            }
        }
    };

    const clearCart = async () => {
        setItems([]);

        if (isAuthenticated) {
            try {
                await api.delete('/cart');
            } catch (error) {
                console.error('Failed to clear server cart:', error);
            }
        } else {
            localStorage.removeItem('cart_items');
        }
    };

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            totalItems,
            totalPrice,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
