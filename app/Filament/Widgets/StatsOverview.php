<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Menu;
use App\Models\Transaction;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class StatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 1;

    public static function canView(): bool
    {
        return auth()->user()->isSuperAdmin();
    }

    protected function getStats(): array
    {
        $user = auth()->user();
        $shopId = $user->isTenantAdmin() ? $user->shop?->id : null;

        // Today's data
        $todayOrders = Order::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereDate('created_at', Carbon::today())
            ->count();

        $todayRevenue = Order::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereDate('created_at', Carbon::today())
            ->whereIn('order_status', ['PROCESSING', 'COMPLETED', 'RECEIVED'])
            ->sum('total_amount');
        
        // This month's data
        $monthOrders = Order::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        $monthRevenue = Order::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->whereIn('order_status', ['PROCESSING', 'COMPLETED', 'RECEIVED'])
            ->sum('total_amount');

        // Pending orders
        $pendingOrders = Order::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->where('order_status', 'PENDING')
            ->count();

        // Total customers (Super Admin only)
        $totalCustomers = Customer::count();

        // Comparison: Yesterday vs Today
        $yesterdayRevenue = Order::when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereDate('created_at', Carbon::yesterday())
            ->whereIn('order_status', ['PROCESSING', 'COMPLETED', 'RECEIVED'])
            ->sum('total_amount');

        $revenueChange = $yesterdayRevenue > 0 
            ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1)
            : ($todayRevenue > 0 ? 100 : 0);

        $stats = [
            Stat::make('Pesanan Hari Ini', $todayOrders)
                ->description('Total pesanan masuk')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),

            Stat::make('Pendapatan Hari Ini', 'Rp ' . number_format($todayRevenue, 0, ',', '.'))
                ->description($revenueChange >= 0 ? "+{$revenueChange}% dari kemarin" : "{$revenueChange}% dari kemarin")
                ->descriptionIcon($revenueChange >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->color($revenueChange >= 0 ? 'success' : 'danger'),

            Stat::make('Pesanan Pending', $pendingOrders)
                ->description('Menunggu pembayaran')
                ->descriptionIcon('heroicon-m-clock')
                ->color($pendingOrders > 5 ? 'warning' : 'gray'),

            Stat::make('Total Bulan Ini', 'Rp ' . number_format($monthRevenue, 0, ',', '.'))
                ->description("{$monthOrders} pesanan")
                ->descriptionIcon('heroicon-m-calendar')
                ->color('info'),
        ];

        // Add customer count for Super Admin
        if ($user->isSuperAdmin()) {
            $stats[] = Stat::make('Total Pelanggan', $totalCustomers)
                ->description('Pelanggan terdaftar')
                ->descriptionIcon('heroicon-m-users')
                ->color('success');
        }

        return $stats;
    }
}
