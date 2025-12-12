<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CancelExpiredOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-expired {--hours=1 : Hours before order expires}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel orders that have been pending for too long and restore stock';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hours = $this->option('hours');
        $expiryTime = Carbon::now()->subHours($hours);

        $this->info("Looking for PENDING orders older than {$hours} hour(s)...");

        // Find expired pending orders (only Midtrans payments, not cash)
        $expiredOrders = Order::where('order_status', Order::STATUS_PENDING)
            ->where('payment_method', Order::PAYMENT_MIDTRANS)
            ->where('created_at', '<', $expiryTime)
            ->get();

        if ($expiredOrders->isEmpty()) {
            $this->info('No expired orders found.');
            return 0;
        }

        $this->info("Found {$expiredOrders->count()} expired order(s). Processing...");

        $cancelledCount = 0;
        $failedCount = 0;

        foreach ($expiredOrders as $order) {
            try {
                DB::beginTransaction();

                // Restore stock for each order item
                $orderItems = OrderItem::where('order_id', $order->id)->get();
                
                foreach ($orderItems as $item) {
                    if ($item->menu) {
                        $item->menu->increment('stock', $item->quantity);
                        $this->line("  - Restored {$item->quantity} stock for menu: {$item->menu->name}");
                    }
                }

                // Update order status to cancelled
                $order->update([
                    'order_status' => Order::STATUS_CANCELLED,
                    'notes' => $order->notes . ' | [AUTO-CANCELLED: Payment expired after ' . $hours . ' hour(s)]'
                ]);

                DB::commit();

                $cancelledCount++;
                $this->info("Order #{$order->id} cancelled successfully.");

                Log::info("Auto-cancelled expired order", [
                    'order_id' => $order->id,
                    'customer_id' => $order->customer_id,
                    'total_amount' => $order->total_amount,
                    'created_at' => $order->created_at,
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                $failedCount++;
                $this->error("Failed to cancel order #{$order->id}: {$e->getMessage()}");
                Log::error("Failed to auto-cancel order", [
                    'order_id' => $order->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("Summary: {$cancelledCount} order(s) cancelled, {$failedCount} failed.");

        return 0;
    }
}
