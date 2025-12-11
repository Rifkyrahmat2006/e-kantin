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
     * Create Midtrans Snap token for multiple orders (grouped payment)
     */
    public function createSnapToken(Request $request)
    {
        \Log::info('Midtrans Config:', [
            'server_key' => $this->serverKey ? 'SET (length: ' . strlen($this->serverKey) . ')' : 'NOT SET',
            'is_production' => $this->isProduction,
        ]);

        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
        ]);

        try {
            $orderIds = $request->order_ids;
            
            // Get all orders
            $orders = Order::with(['orderItems.menu', 'customer', 'shop'])
                ->where('customer_id', $request->user()->id)
                ->whereIn('id', $orderIds)
                ->get();

            if ($orders->count() !== count($orderIds)) {
                return response()->json([
                    'message' => 'Some orders were not found or do not belong to you',
                ], 400);
            }

            // Check if any order is already paid
            foreach ($orders as $order) {
                $existingTransaction = Transaction::where('order_id', $order->id)
                    ->where('payment_status', Transaction::STATUS_PAID)
                    ->first();

                if ($existingTransaction) {
                    return response()->json([
                        'message' => 'Order #' . $order->id . ' is already paid',
                    ], 400);
                }
            }

            // Generate payment group ID
            $paymentGroupId = 'PG-' . time() . '-' . $request->user()->id;

            // Update all orders with the same payment_group_id
            Order::whereIn('id', $orderIds)->update(['payment_group_id' => $paymentGroupId]);

            // Calculate total and prepare item details
            $totalAmount = 0;
            $itemDetails = [];

            foreach ($orders as $order) {
                foreach ($order->orderItems as $item) {
                    $itemDetails[] = [
                        'id' => (string) $item->menu_id,
                        'price' => (int) $item->unit_price,
                        'quantity' => (int) $item->quantity,
                        'name' => substr(($order->shop->name ?? 'Shop') . ' - ' . ($item->menu->name ?? 'Item'), 0, 50),
                    ];
                }
                $totalAmount += (int) $order->total_amount;
            }

            // Create unique order ID for Midtrans
            $midtransOrderId = $paymentGroupId;

            // Use request user as fallback for customer details
            $user = $request->user();
            $customer = $orders->first()->customer;

            // Prepare payload
            $payload = [
                'transaction_details' => [
                    'order_id' => $midtransOrderId,
                    'gross_amount' => $totalAmount,
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

            // Create transaction records for each order
            foreach ($orders as $order) {
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
            }

            return response()->json([
                'snap_token' => $snapToken,
                'order_ids' => $orderIds,
                'payment_group_id' => $paymentGroupId,
                'midtrans_order_id' => $midtransOrderId,
                'client_key' => config('midtrans.client_key'),
                'total_amount' => $totalAmount,
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
            $orderId = $notification->order_id; // This is payment_group_id (PG-xxx)
            $fraudStatus = $notification->fraud_status ?? null;

            // Find all transactions with this reference_code (payment_group_id)
            $transactions = Transaction::where('reference_code', $orderId)->get();
            
            if ($transactions->isEmpty()) {
                return response()->json(['message' => 'Transaction not found'], 404);
            }

            // Handle different transaction statuses
            foreach ($transactions as $transaction) {
                $order = Order::find($transaction->order_id);
                
                if (!$order) continue;

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
     * Supports both single order_id and payment_group_id
     */
    public function updateStatus(Request $request)
    {
        $request->validate([
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:orders,id',
            'status' => 'required|in:success,pending,error',
        ]);

        $orders = Order::where('customer_id', $request->user()->id)
            ->whereIn('id', $request->order_ids)
            ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'Orders not found'], 404);
        }

        foreach ($orders as $order) {
            $transaction = Transaction::where('order_id', $order->id)->first();

            if (!$transaction) continue;

            if ($request->status === 'success') {
                $transaction->update(['payment_status' => Transaction::STATUS_PAID]);
                $order->update(['order_status' => Order::STATUS_PROCESSING]);
            } elseif ($request->status === 'error') {
                $transaction->update(['payment_status' => Transaction::STATUS_FAILED]);
            }
        }

        return response()->json([
            'message' => 'Status updated',
            'order_ids' => $request->order_ids,
        ]);
    }
}
