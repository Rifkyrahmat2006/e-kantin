<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    /**
     * Handle Google Login using ID Token from frontend
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        try {
            // Verify the ID Token with Google
            // Using tokeninfo endpoint is simpler than setting up Google Client library
            // for just verification when we already have the token.
            $response = Http::withoutVerifying()->get('https://oauth2.googleapis.com/tokeninfo', [
                'id_token' => $request->credential,
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'message' => 'Invalid Google Token',
                    'error' => $response->json()
                ], 401);
            }

            $payload = $response->json();

            // Verify Audience (Client ID)
            // You should store your Client ID in .env
            $clientId = '1084439484932-a53s4dafu0gtl0pb30ugkd6vesssjktq.apps.googleusercontent.com';
            if ($payload['aud'] !== $clientId) {
                return response()->json(['message' => 'Invalid Client ID'], 401);
            }

            // Get user info from payload
            $googleId = $payload['sub'];
            $email = $payload['email'];
            $name = $payload['name'];
            $avatar = $payload['picture'] ?? null;

            // Find or create customer
            $customer = Customer::where('google_id', $googleId)
                ->orWhere('email', $email)
                ->first();

            if ($customer) {
                // Update existing customer
                if (!$customer->google_id) {
                    $customer->google_id = $googleId;
                }
                if (!$customer->avatar && $avatar) {
                    $customer->avatar = $avatar;
                }
                $customer->save();
            } else {
                // Create new customer
                $customer = Customer::create([
                    'name' => $name,
                    'email' => $email,
                    'google_id' => $googleId,
                    'avatar' => $avatar,
                    'password' => null, // No password for Google users
                    'table_number' => '0', // Default
                ]);
            }

            // Generate token (using Sanctum)
            $token = $customer->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Login successful',
                'token' => $token,
                'user' => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'email' => $customer->email,
                    'role' => 'customer',
                    'avatar_url' => $this->getAvatarUrl($customer->avatar),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Google Login Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
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
