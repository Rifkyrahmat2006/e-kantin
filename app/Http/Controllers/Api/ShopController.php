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
        $shops = Shop::all();

        return response()->json([
            'shops' => $shops,
        ]);
    }

    /**
     * Get shop details
     */
    public function show($id)
    {
        $shop = Shop::findOrFail($id);

        return response()->json([
            'shop' => $shop,
        ]);
    }
}
