<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuCategory;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * Get all active menus
     */
    public function index(Request $request)
    {
        $query = Menu::where('status', 'available')
            ->where('stock', '>', 0)
            ->where('stock', '>', 0)
            ->with(['category', 'shop']);

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhereHas('shop', function ($q) use ($search) {
                        $q->where('name', 'like', '%' . $search . '%');
                    });
            });
        }

        $menus = $query->get();

        return response()->json([
            'menus' => $menus,
        ]);
    }
    /**
     * Get all active menu categories
     */
    public function categories()
    {
        $categories = MenuCategory::where('status', 'active')
            ->withCount('menus')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Get menus by category
     */
    public function menusByCategory(Request $request, $categoryId)
    {
        $category = MenuCategory::findOrFail($categoryId);
        
        $query = Menu::where('menu_category_id', $categoryId)
            ->where('status', 'available')
            ->where('stock', '>', 0);

        if ($request->has('shop_id')) {
            $query->where('shop_id', $request->shop_id);
        }

        $menus = $query->get();

        return response()->json([
            'category' => $category,
            'menus' => $menus,
        ]);
    }

    /**
     * Get single menu details
     */
    public function show($id)
    {
        $menu = Menu::with(['category', 'shop'])->findOrFail($id);

        return response()->json([
            'menu' => $menu,
        ]);
    }
}
