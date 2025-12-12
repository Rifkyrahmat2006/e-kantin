<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\MenuReview;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * Get reviews for a specific menu
     */
    public function index($menuId)
    {
        $menu = Menu::findOrFail($menuId);
        
        $reviews = $menu->reviews()
            ->with('customer:id,name,avatar')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => $menu->average_rating,
            'reviews_count' => $menu->reviews_count,
        ]);
    }

    /**
     * Store a new review
     */
    public function store(Request $request, $menuId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $menu = Menu::findOrFail($menuId);
        $user = $request->user();
        
        // Only customers can review
        if (!($user instanceof \App\Models\Customer)) {
            return response()->json([
                'message' => 'Hanya customer yang dapat memberikan review.',
            ], 403);
        }

        // Check if customer already reviewed this menu
        $existingReview = MenuReview::where('customer_id', $user->id)
            ->where('menu_id', $menuId)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Anda sudah memberikan review untuk menu ini.',
            ], 422);
        }

        $review = MenuReview::create([
            'customer_id' => $user->id,
            'menu_id' => $menuId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        $review->load('customer:id,name,avatar');

        return response()->json([
            'message' => 'Review berhasil ditambahkan!',
            'review' => $review,
        ], 201);
    }

    /**
     * Delete a review (only owner can delete)
     */
    public function destroy(Request $request, $id)
    {
        $review = MenuReview::findOrFail($id);
        $user = $request->user();

        // Only the customer who wrote the review can delete it
        if (!($user instanceof \App\Models\Customer) || $review->customer_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak berhak menghapus review ini.',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review berhasil dihapus.',
        ]);
    }
}
