<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return view('customer');
})->name('home');

Route::get('/admin/login', function () {
    return redirect('/login');
})->name('filament.admin.auth.login');

Route::get('/login', function () {
    return view('customer');
})->name('login');

Route::post('/login', [App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/logout', [App\Http\Controllers\Api\AuthController::class, 'logout']);

Route::get('/register', function () {
    return view('customer');
})->name('register');

// Admin/Auth routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';

// Catch-all route for React Router (must be last)
Route::get('/{any}', function () {
    return view('customer');
})->where('any', '.*');
