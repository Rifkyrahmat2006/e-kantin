<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new customer
     */
    public function register(RegisterCustomerRequest $request)
    {
        $customer = Customer::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Will be hashed by mutator
            'phone' => $request->phone,
        ]);

        $token = $customer->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'user' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'role' => 'customer',
                'avatar_url' => null,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Login customer
     */
    /**
     * Login customer or admin
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Attempt Admin Login first
        if (\Illuminate\Support\Facades\Auth::guard('web')->attempt($request->only('email', 'password'))) {
            $user = \Illuminate\Support\Facades\Auth::guard('web')->user();
            
            // Create token for admin (optional, if you want to use API for admin too, 
            // but for now we just need the session for Filament)
            // Note: Filament uses session auth by default.
            // We return a token so the frontend knows we are logged in.
            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil as Admin',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => 'admin',
                    'avatar_url' => $this->getAvatarUrl($user->avatar),
                ],
                'token' => $token,
            ]);
        }

        // Attempt Customer Login
        $customer = Customer::where('email', $request->email)->first();

        if (!$customer || !Hash::check($request->password, $customer->password)) {
            throw ValidationException::withMessages([
                'email' => ['Username atau password yang diberikan salah.'],
            ]);
        }

        $token = $customer->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'user' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'role' => 'customer',
                'avatar_url' => $this->getAvatarUrl($customer->avatar),
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout customer (revoke token)
     */
    /**
     * Logout customer (revoke token and session)
     */
    public function logout(Request $request)
    {
        // Revoke token if exists (for API/Sanctum)
        // Revoke token if exists (for API/Sanctum)
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        // Logout web session (for Filament/Admin)
        \Illuminate\Support\Facades\Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get authenticated customer info
     */
    public function me(Request $request)
    {
        $user = $request->user();
        // Determine role based on class
        $role = $user instanceof \App\Models\User ? 'admin' : 'customer';

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $role,
                'role' => $role,
                'avatar_url' => $this->getAvatarUrl($user->avatar),
            ],
        ]);
    }
    /**
     * Update customer profile (avatar and name)
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'avatar' => 'nullable|image|max:2048', // Max 2MB
        ]);

        $user = $request->user();
        $user->name = $request->name;

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && \Illuminate\Support\Facades\Storage::exists('public/' . $user->avatar)) {
                \Illuminate\Support\Facades\Storage::delete('public/' . $user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            
            // Optimize the uploaded image
            try {
                \Spatie\LaravelImageOptimizer\Facades\ImageOptimizer::optimize(storage_path('app/public/' . $path));
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Illuminate\Support\Facades\Log::error('Image optimization failed: ' . $e->getMessage());
            }

            // Store relative path
            $user->avatar = $path;
        }

        // Handle avatar removal
        if ($request->boolean('remove_avatar')) {
             if ($user->avatar && \Illuminate\Support\Facades\Storage::exists('public/' . $user->avatar)) {
                \Illuminate\Support\Facades\Storage::delete('public/' . $user->avatar);
            }
            $user->avatar = null;
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user instanceof \App\Models\User ? 'admin' : 'customer',
                'avatar_url' => $this->getAvatarUrl($user->avatar),
            ],
        ]);
    }

    /**
     * Change customer password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->password = $request->new_password; // Will be hashed by mutator
        $user->save();

        return response()->json([
            'message' => 'Password berhasil diubah',
        ]);
    }

    /**
     * Get avatar URL - handles both external URLs (Google) and local storage paths
     */
    private function getAvatarUrl(?string $avatar): ?string
    {
        if (!$avatar) {
            return null;
        }

        // If it's already a full URL (external like Google), return as-is
        if (str_starts_with($avatar, 'http://') || str_starts_with($avatar, 'https://')) {
            return $avatar;
        }

        // Otherwise, it's a local storage path
        return asset('storage/' . $avatar);
    }
}
