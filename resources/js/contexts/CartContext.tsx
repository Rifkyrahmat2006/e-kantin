import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import api from '../lib/api';

export interface CartItem {
    id: number; // Menu ID
    name: string;
    price: number;
    quantity: number;
    image?: string;
    shop_id: number;
    shop_name?: string;
    stock?: number; // Available stock for validation
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    selectedItems: Set<number>;
    selectedTotalPrice: number;
    selectedItemsCount: number;
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;
    toggleItemSelection: (itemId: number) => void;
    toggleTenantSelection: (shopId: number) => void;
    selectAll: () => void;
    deselectAll: () => void;
    isItemSelected: (itemId: number) => boolean;
    isTenantFullySelected: (shopId: number) => boolean;
    isTenantPartiallySelected: (shopId: number) => boolean;
    getSelectedItems: () => CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();

    // Load cart from local storage or API
    useEffect(() => {
        const loadCart = async () => {
            if (isAuthenticated) {
                try {
                    const response = await api.get('/cart');
                    setItems(response.data.items);
                    // Auto-select all items when loading
                    setSelectedItems(new Set(response.data.items.map((item: CartItem) => item.id)));
                } catch (error) {
                    console.error('Failed to fetch cart from server:', error);
                }
            } else {
                const storedCart = localStorage.getItem('cart_items');
                if (storedCart) {
                    try {
                        const parsedItems = JSON.parse(storedCart);
                        setItems(parsedItems);
                        // Auto-select all items
                        setSelectedItems(new Set(parsedItems.map((item: CartItem) => item.id)));
                    } catch (e) {
                        console.error('Failed to parse cart items', e);
                    }
                } else {
                    setItems([]);
                    setSelectedItems(new Set());
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

    // Clean up selectedItems when items change (remove selections for removed items)
    useEffect(() => {
        const itemIds = new Set(items.map(item => item.id));
        setSelectedItems(prev => {
            const newSelected = new Set<number>();
            prev.forEach(id => {
                if (itemIds.has(id)) {
                    newSelected.add(id);
                }
            });
            return newSelected;
        });
    }, [items]);

    const addToCart = async (newItem: CartItem) => {
        // Optimistic update
        setItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === newItem.id);
            if (existingItemIndex >= 0) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
                };
                return updatedItems;
            } else {
                return [...prevItems, newItem];
            }
        });

        // Auto-select new item
        setSelectedItems(prev => new Set([...prev, newItem.id]));

        showToast('Item added to cart', 'success');

        if (isAuthenticated) {
            try {
                await api.post('/cart', {
                    menu_id: newItem.id,
                    quantity: newItem.quantity
                });
            } catch (error) {
                console.error('Failed to add item to server cart:', error);
                showToast('Failed to sync with server', 'warning');
            }
        }
    };

    const removeFromCart = async (itemId: number) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(itemId);
            return newSet;
        });
        showToast('Item removed from cart', 'info');

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
        setSelectedItems(new Set());

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

    // Selection functions
    const isItemInStock = (item: CartItem) => {
        if (item.stock === undefined) return true;
        return item.stock > 0 && item.quantity <= item.stock;
    };

    const toggleItemSelection = (itemId: number) => {
        const item = items.find(i => i.id === itemId);
        if (item && !isItemInStock(item)) {
            return; // Don't allow selection of out-of-stock items
        }
        
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const toggleTenantSelection = (shopId: number) => {
        const tenantItems = items.filter(item => item.shop_id === shopId && isItemInStock(item));
        const allSelected = tenantItems.every(item => selectedItems.has(item.id));

        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (allSelected) {
                // Deselect all tenant items
                tenantItems.forEach(item => newSet.delete(item.id));
            } else {
                // Select all tenant items (only in-stock ones)
                tenantItems.forEach(item => newSet.add(item.id));
            }
            return newSet;
        });
    };

    const selectAll = () => {
        // Only select items that are in stock
        const inStockItems = items.filter(isItemInStock);
        setSelectedItems(new Set(inStockItems.map(item => item.id)));
    };

    const deselectAll = () => {
        setSelectedItems(new Set());
    };

    const isItemSelected = (itemId: number) => selectedItems.has(itemId);

    const isTenantFullySelected = (shopId: number) => {
        const tenantItems = items.filter(item => item.shop_id === shopId);
        return tenantItems.length > 0 && tenantItems.every(item => selectedItems.has(item.id));
    };

    const isTenantPartiallySelected = (shopId: number) => {
        const tenantItems = items.filter(item => item.shop_id === shopId);
        const selectedCount = tenantItems.filter(item => selectedItems.has(item.id)).length;
        return selectedCount > 0 && selectedCount < tenantItems.length;
    };

    const getSelectedItems = () => {
        return items.filter(item => selectedItems.has(item.id));
    };

    const totalItems = items.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const selectedTotalPrice = items
        .filter(item => selectedItems.has(item.id))
        .reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const selectedItemsCount = items
        .filter(item => selectedItems.has(item.id))
        .reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            totalItems,
            totalPrice,
            selectedItems,
            selectedTotalPrice,
            selectedItemsCount,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleItemSelection,
            toggleTenantSelection,
            selectAll,
            deselectAll,
            isItemSelected,
            isTenantFullySelected,
            isTenantPartiallySelected,
            getSelectedItems
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
