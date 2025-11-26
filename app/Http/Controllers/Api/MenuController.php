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
    public function index()
    {
        $menus = Menu::where('status', 'available')
            ->where('stock', '>', 0)
            ->with('category')
            ->get();

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
    public function menusByCategory($categoryId)
    {
        $category = MenuCategory::findOrFail($categoryId);
        
        $menus = Menu::where('menu_category_id', $categoryId)
            ->where('status', 'available')
            ->where('stock', '>', 0)
            ->get();

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
        $menu = Menu::with('category')->findOrFail($id);

        return response()->json([
            'menu' => $menu,
        ]);
    }
}
