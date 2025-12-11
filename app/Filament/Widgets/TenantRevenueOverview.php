<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Settlement;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class TenantRevenueOverview extends StatsOverviewWidget
{
    protected static ?int $sort = 0;
    protected int | string | array $columnSpan = 'full';

    public static function canView(): bool
    {
        return auth()->user()->isTenantAdmin();
    }

    protected function getStats(): array
    {
        $user = auth()->user();
        $shopId = $user->shop?->id;

        if (!$shopId) {
            return [];
        }

        // Today's revenue (completed orders)
        $todayRevenue = Order::where('shop_id', $shopId)
            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
            ->whereDate('created_at', Carbon::today())
            ->sum('total_amount');

        // Total lifetime revenue (completed orders)
        $totalRevenue = Order::where('shop_id', $shopId)
            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
            ->sum('total_amount');

        // Total already settled
        $totalSettled = Settlement::where('shop_id', $shopId)
            ->where('status', Settlement::STATUS_COMPLETED)
            ->sum('amount');

        // Pending settlement (awaiting process)
        $pendingSettlement = Settlement::where('shop_id', $shopId)
            ->whereIn('status', [Settlement::STATUS_PENDING, Settlement::STATUS_PROCESSING])
            ->sum('amount');

        // Available for withdrawal (not yet in settlement)
        $availableBalance = max(0, $totalRevenue - $totalSettled - $pendingSettlement);

        // This month's revenue
        $monthRevenue = Order::where('shop_id', $shopId)
            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->sum('total_amount');

        // Today's order count
        $todayOrderCount = Order::where('shop_id', $shopId)
            ->whereDate('created_at', Carbon::today())
            ->count();

        // Paid orders count (Processing, Completed, Received)
        $paidOrdersCount = Order::where('shop_id', $shopId)
            ->whereIn('order_status', ['PROCESSING', 'COMPLETED', 'RECEIVED'])
            ->count();

        return [
            Stat::make('Pendapatan Hari Ini', 'Rp ' . number_format($todayRevenue, 0, ',', '.'))
                ->description('Dari pesanan selesai')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),

            Stat::make('Saldo Tersedia', 'Rp ' . number_format($availableBalance, 0, ',', '.'))
                ->description('Siap ditarik')
                ->descriptionIcon('heroicon-m-wallet')
                ->color($availableBalance > 0 ? 'success' : 'gray'),

            Stat::make('Pendapatan Bulan Ini', 'Rp ' . number_format($monthRevenue, 0, ',', '.'))
                ->description(Carbon::now()->format('F Y'))
                ->descriptionIcon('heroicon-m-calendar')
                ->color('primary'),

            Stat::make('Sudah Ditarik', 'Rp ' . number_format($totalSettled, 0, ',', '.'))
                ->description('Total settlement')
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('info'),

            Stat::make('Pesanan Hari Ini', $todayOrderCount)
                ->description('Total pesanan masuk')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('warning'),

            Stat::make('Pesanan Telah Dibayar', $paidOrdersCount)
                ->description('Total pesanan terbayar')
                ->descriptionIcon('heroicon-m-credit-card')
                ->color('success'),
        ];
    }
}
