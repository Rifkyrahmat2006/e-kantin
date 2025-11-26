<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    /**
     * Get all open shops
     */
    public function index()
    {
        $shops = Shop::where('status', 'open')->get();

        return response()->json([
            'shops' => $shops,
        ]);
    }

    /**
     * Get shop details
     */
    public function show($id)
    {
        $shop = Shop::where('status', 'open')->findOrFail($id);

        return response()->json([
            'shop' => $shop,
        ]);
    }
}
