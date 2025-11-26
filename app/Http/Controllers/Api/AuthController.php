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
        if ($request->user()) {
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
            ],
        ]);
    }
}
