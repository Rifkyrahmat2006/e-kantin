<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Menu;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * Get user's cart items
     */
    public function index(Request $request)
    {
        $items = CartItem::where('user_id', $request->user()->id)
            ->with(['menu', 'menu.shop'])
            ->get();

        // Filter out items where menu has been deleted
        $validItems = $items->filter(fn($item) => $item->menu !== null);
        
        // Clean up orphaned cart items (where menu was deleted)
        $orphanedIds = $items->filter(fn($item) => $item->menu === null)->pluck('id');
        if ($orphanedIds->isNotEmpty()) {
            CartItem::whereIn('id', $orphanedIds)->delete();
        }

        // Transform to match frontend CartItem interface
        $formattedItems = $validItems->map(function ($item) {
            return [
                'id' => $item->menu->id,
                'name' => $item->menu->name,
                'price' => $item->menu->price,
                'quantity' => $item->quantity,
                'image' => $item->menu->image_url,
                'shop_id' => $item->menu->shop_id,
                'shop_name' => $item->menu->shop->name ?? 'Unknown Shop',
                'stock' => $item->menu->stock, // Include stock for validation
            ];
        })->values();

        return response()->json([
            'items' => $formattedItems,
        ]);
    }

    /**
     * Add or update item in cart
     */
    public function store(Request $request)
    {
        $request->validate([
            'menu_id' => 'required|exists:menus,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'menu_id' => $request->menu_id,
            ],
            [
                'quantity' => \DB::raw("quantity + {$request->quantity}"),
            ]
        );

        // If it was an update, we might want to set absolute quantity instead of incrementing
        // But for "Add to Cart" button, incrementing is usually expected.
        // However, if the frontend sends the *new total quantity*, we should handle that differently.
        // Let's assume "Add to Cart" increments, and "Update Quantity" (in cart) sets absolute value.
        // Actually, let's make a separate method for updating or handle based on a flag.
        // For simplicity, let's assume this endpoint is for "Add to Cart" (increment) 
        // OR "Sync" (set absolute).
        
        // Let's stick to "Add to Cart" behavior (increment) for now, or handle 'set_quantity' flag.
        if ($request->has('set_quantity')) {
             $cartItem->quantity = $request->quantity;
             $cartItem->save();
        }

        return response()->json(['message' => 'Item added to cart']);
    }

    /**
     * Update cart item quantity (absolute value)
     */
    public function update(Request $request, $menuId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        if ($request->quantity == 0) {
            CartItem::where('user_id', $request->user()->id)
                ->where('menu_id', $menuId)
                ->delete();
        } else {
            CartItem::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'menu_id' => $menuId,
                ],
                [
                    'quantity' => $request->quantity,
                ]
            );
        }

        return response()->json(['message' => 'Cart updated']);
    }

    /**
     * Remove item from cart
     */
    public function destroy(Request $request, $menuId)
    {
        CartItem::where('user_id', $request->user()->id)
            ->where('menu_id', $menuId)
            ->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    /**
     * Clear cart
     */
    public function clear(Request $request)
    {
        CartItem::where('user_id', $request->user()->id)->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
}
