<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuLike;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /**
     * Toggle like for a menu
     */
    public function toggle(Request $request, $menuId)
    {
        $menu = Menu::findOrFail($menuId);
        $user = $request->user();
        
        // Only customers can like
        if (!($user instanceof \App\Models\Customer)) {
            return response()->json([
                'message' => 'Hanya customer yang dapat menyukai menu.',
            ], 403);
        }

        $existingLike = MenuLike::where('customer_id', $user->id)
            ->where('menu_id', $menuId)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            // Get count directly without reloading entire model
            $likesCount = MenuLike::where('menu_id', $menuId)->count();
            return response()->json([
                'message' => 'Like dihapus.',
                'liked' => false,
                'likes_count' => $likesCount,
            ]);
        }

        MenuLike::create([
            'customer_id' => $user->id,
            'menu_id' => $menuId,
        ]);

        // Get count directly without reloading entire model
        $likesCount = MenuLike::where('menu_id', $menuId)->count();

        return response()->json([
            'message' => 'Menu disukai!',
            'liked' => true,
            'likes_count' => $likesCount,
        ]);
    }

    /**
     * Check if current user has liked the menu
     */
    public function status(Request $request, $menuId)
    {
        $user = $request->user();
        
        // Get count directly
        $likesCount = MenuLike::where('menu_id', $menuId)->count();
        
        // Only customers can have like status
        if (!($user instanceof \App\Models\Customer)) {
            return response()->json([
                'liked' => false,
                'likes_count' => $likesCount,
            ]);
        }

        $liked = MenuLike::where('customer_id', $user->id)
            ->where('menu_id', $menuId)
            ->exists();

        return response()->json([
            'liked' => $liked,
            'likes_count' => $likesCount,
        ]);
    }
}
