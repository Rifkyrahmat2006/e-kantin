<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ShopController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
// Route::post('/login', [AuthController::class, 'login']); // Moved to web.php for session support

// Public menu routes
Route::get('/menus', [MenuController::class, 'index']);
Route::get('/categories', [MenuController::class, 'categories']);
Route::get('/categories/{id}/menus', [MenuController::class, 'menusByCategory']);
Route::get('/menus/{id}', [MenuController::class, 'show']);

// Public shop routes
Route::get('/shops', [ShopController::class, 'index']);
Route::get('/shops/{id}', [ShopController::class, 'show']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    // Route::post('/logout', [AuthController::class, 'logout']); // Moved to web.php
    Route::get('/me', [AuthController::class, 'me']);
    
    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Cart routes
    Route::get('/cart', [App\Http\Controllers\Api\CartController::class, 'index']);
    Route::post('/cart', [App\Http\Controllers\Api\CartController::class, 'store']);
    Route::put('/cart/{menuId}', [App\Http\Controllers\Api\CartController::class, 'update']);
    Route::delete('/cart/{menuId}', [App\Http\Controllers\Api\CartController::class, 'destroy']);
    Route::delete('/cart', [App\Http\Controllers\Api\CartController::class, 'clear']);
});
