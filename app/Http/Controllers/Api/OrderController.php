<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Get customer's order history
     */
    public function index(Request $request)
    {
        $orders = Order::where('customer_id', $request->user()->id)
            ->with(['orderItems.menu'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    /**
     * Create new order
     */
    public function store(StoreOrderRequest $request)
    {
        try {
            DB::beginTransaction();

            // Update customer table number
            $request->user()->update(['table_number' => $request->table_number]);

            // Create order
            $order = Order::create([
                'customer_id' => $request->user()->id,
                'order_time' => now(),
                'total_amount' => 0, // Will calculate below
                'order_status' => Order::STATUS_PENDING,
                'notes' => $request->notes,
            ]);

            $totalAmount = 0;

            // Create order items
            foreach ($request->items as $item) {
                $menu = Menu::findOrFail($item['menu_id']);

                // Validate stock
                if ($menu->stock < $item['quantity']) {
                    throw new \Exception("Insufficient stock for {$menu->name}");
                }

                // Validate status
                if ($menu->status !== 'available') {
                    throw new \Exception("{$menu->name} is not available");
                }

                $subtotal = $menu->price * $item['quantity'];
                $totalAmount += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_id' => $menu->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $menu->price,
                    'subtotal' => $subtotal,
                ]);

                // Reduce stock
                $menu->decrement('stock', $item['quantity']);
            }

            // Update order total
            $order->update(['total_amount' => $totalAmount]);

            DB::commit();

            // Load relationships for response
            $order->load(['orderItems.menu', 'customer']);

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get order details
     */
    public function show(Request $request, $id)
    {
        $order = Order::where('customer_id', $request->user()->id)
            ->with(['orderItems.menu', 'customer'])
            ->findOrFail($id);

        return response()->json([
            'order' => $order,
        ]);
    }
}
