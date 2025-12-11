<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class OrderStatusChart extends ChartWidget
{
    protected static ?string $heading = 'Status Pesanan Hari Ini';
    protected static ?int $sort = 4;
    protected int | string | array $columnSpan = 1;

    protected function getData(): array
    {
        $user = auth()->user();
        $shopId = $user->isTenantAdmin() ? $user->shop?->id : null;

        $statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'RECEIVED', 'CANCELLED'];
        $colors = [
            'PENDING' => 'rgba(245, 158, 11, 0.8)',      // amber
            'PROCESSING' => 'rgba(59, 130, 246, 0.8)',   // blue
            'COMPLETED' => 'rgba(16, 185, 129, 0.8)',    // green
            'RECEIVED' => 'rgba(34, 197, 94, 0.8)',      // emerald
            'CANCELLED' => 'rgba(239, 68, 68, 0.8)',     // red
        ];
        $labels = [
            'PENDING' => 'Pending',
            'PROCESSING' => 'Diproses',
            'COMPLETED' => 'Selesai',
            'RECEIVED' => 'Diterima',
            'CANCELLED' => 'Dibatalkan',
        ];

        $data = [];
        $backgroundColors = [];
        $displayLabels = [];

        foreach ($statuses as $status) {
            $count = Order::query()
                ->when($shopId, fn($q) => $q->where('shop_id', $shopId))
                ->whereDate('created_at', Carbon::today())
                ->where('order_status', $status)
                ->count();
            
            if ($count > 0) {
                $data[] = $count;
                $backgroundColors[] = $colors[$status];
                $displayLabels[] = $labels[$status];
            }
        }

        // If no data today, show empty state
        if (empty($data)) {
            $data = [1];
            $backgroundColors = ['rgba(156, 163, 175, 0.5)'];
            $displayLabels = ['Belum ada pesanan'];
        }

        return [
            'datasets' => [
                [
                    'label' => 'Pesanan',
                    'data' => $data,
                    'backgroundColor' => $backgroundColors,
                ],
            ],
            'labels' => $displayLabels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'position' => 'bottom',
                ],
            ],
        ];
    }
}
