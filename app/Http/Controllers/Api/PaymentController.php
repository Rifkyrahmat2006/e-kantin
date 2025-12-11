<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    private $serverKey;
    private $isProduction;

    public function __construct()
    {
        $this->serverKey = config('midtrans.server_key');
        $this->isProduction = config('midtrans.is_production');
    }

    /**
     * Create Midtrans Snap token for an order
     */
    public function createSnapToken(Request $request)
    {
        \Log::info('Midtrans Config:', [
            'server_key' => $this->serverKey ? 'SET (length: ' . strlen($this->serverKey) . ')' : 'NOT SET',
            'is_production' => $this->isProduction,
        ]);

        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        try {
            $order = Order::with(['orderItems.menu', 'customer', 'shop'])
                ->where('customer_id', $request->user()->id)
                ->findOrFail($request->order_id);

            // Check if order already has a paid transaction
            $existingTransaction = Transaction::where('order_id', $order->id)
                ->where('payment_status', Transaction::STATUS_PAID)
                ->first();

            if ($existingTransaction) {
                return response()->json([
                    'message' => 'Order already paid',
                ], 400);
            }

            // Create unique order ID for Midtrans
            $midtransOrderId = 'ORDER-' . $order->id . '-' . time();

            // Prepare item details
            $itemDetails = [];
            foreach ($order->orderItems as $item) {
                $itemDetails[] = [
                    'id' => (string) $item->menu_id,
                    'price' => (int) $item->unit_price,
                    'quantity' => (int) $item->quantity,
                    'name' => substr($item->menu->name ?? 'Item', 0, 50),
                ];
            }

            // Use request user as fallback for customer details
            $user = $request->user();
            $customer = $order->customer;

            // Prepare payload
            $payload = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => (int) $order->total_amount,
                ],
                'customer_details' => [
                    'first_name' => $customer->name ?? $user->name ?? 'Customer',
                    'email' => $customer->email ?? $user->email ?? 'customer@example.com',
                    'phone' => $customer->phone ?? $user->phone ?? '',
                ],
                'item_details' => $itemDetails,
            ];

            \Log::info('Creating Snap token with payload:', $payload);

            // Use Guzzle HTTP client with SSL verification disabled for development
            $baseUrl = $this->isProduction 
                ? 'https://app.midtrans.com' 
                : 'https://app.sandbox.midtrans.com';

            $response = Http::withOptions(['verify' => false])
                ->withBasicAuth($this->serverKey, '')
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($baseUrl . '/snap/v1/transactions', $payload);

            if ($response->failed()) {
                \Log::error('Midtrans API error:', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \Exception('Midtrans API error: ' . $response->body());
            }

            $snapData = $response->json();
            $snapToken = $snapData['token'] ?? null;

            if (!$snapToken) {
                throw new \Exception('No token in Midtrans response');
            }

            // Create or update transaction record
            Transaction::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'customer_id' => $order->customer_id,
                    'amount_paid' => $order->total_amount,
                    'payment_method' => 'MIDTRANS',
                    'payment_status' => Transaction::STATUS_PENDING,
                    'reference_code' => $midtransOrderId,
                    'transaction_time' => now(),
                ]
            );

            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $order->id,
                'midtrans_order_id' => $midtransOrderId,
                'client_key' => config('midtrans.client_key'),
                'total_amount' => (int) $order->total_amount,
            ]);
        } catch (\Exception $e) {
            \Log::error('Midtrans error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to create payment token',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Midtrans webhook notification
     */
    public function handleNotification(Request $request)
    {
        try {
            $notification = new \Midtrans\Notification();

            $transactionStatus = $notification->transaction_status;
            $orderId = $notification->order_id;
            $fraudStatus = $notification->fraud_status ?? null;

            // Extract actual order ID from midtrans order ID (ORDER-{id}-{timestamp})
            preg_match('/ORDER-(\d+)-/', $orderId, $matches);
            $actualOrderId = $matches[1] ?? null;

            if (!$actualOrderId) {
                return response()->json(['message' => 'Invalid order ID format'], 400);
            }

            $transaction = Transaction::where('reference_code', $orderId)->first();
            $order = Order::find($actualOrderId);

            if (!$transaction || !$order) {
                return response()->json(['message' => 'Transaction or order not found'], 404);
            }

            // Handle different transaction statuses
            if ($transactionStatus == 'capture') {
                if ($fraudStatus == 'accept') {
                    $transaction->update(['payment_status' => Transaction::STATUS_PAID]);
                    $order->update(['order_status' => Order::STATUS_PROCESSING]);
                }
            } elseif ($transactionStatus == 'settlement') {
                $transaction->update(['payment_status' => Transaction::STATUS_PAID]);
                $order->update(['order_status' => Order::STATUS_PROCESSING]);
            } elseif ($transactionStatus == 'pending') {
                $transaction->update(['payment_status' => Transaction::STATUS_PENDING]);
            } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel'])) {
                $transaction->update(['payment_status' => Transaction::STATUS_FAILED]);
                $order->update(['order_status' => Order::STATUS_CANCELLED]);
            }

            return response()->json(['message' => 'Notification handled']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to handle notification',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update payment status manually (for frontend callback)
     */
    public function updateStatus(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'status' => 'required|in:success,pending,error',
        ]);

        $order = Order::where('customer_id', $request->user()->id)
            ->findOrFail($request->order_id);

        $transaction = Transaction::where('order_id', $order->id)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        if ($request->status === 'success') {
            $transaction->update(['payment_status' => Transaction::STATUS_PAID]);
            $order->update(['order_status' => Order::STATUS_PROCESSING]);
        } elseif ($request->status === 'error') {
            $transaction->update(['payment_status' => Transaction::STATUS_FAILED]);
        }

        return response()->json([
            'message' => 'Status updated',
            'order' => $order->fresh(),
        ]);
    }
}
