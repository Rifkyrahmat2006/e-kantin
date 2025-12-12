<?php

namespace App\Filament\Widgets;

use App\Models\OrderItem;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class BestSellingMenuChart extends ChartWidget
{
    protected static ?string $heading = 'Menu Paling Laku';
    protected static ?int $sort = 4;
    protected int | string | array $columnSpan = 1;

    // Optional: Filter by time range if desired, similar to OrdersChart
    public ?string $filter = '30days';

    protected function getFilters(): ?array
    {
        return [
            '7days' => '7 Hari Terakhir',
            '30days' => '30 Hari Terakhir',
            'thisMonth' => 'Bulan Ini',
            'all' => 'Semua Waktu',
        ];
    }

    protected function getData(): array
    {
        $user = auth()->user();
        $shopId = $user->isTenantAdmin() ? $user->shop?->id : null;

        // Determine date range
        $startDate = match ($this->filter) {
            '7days' => now()->subDays(7),
            '30days' => now()->subDays(30),
            'thisMonth' => now()->startOfMonth(),
            default => null,
        };

        $query = OrderItem::query()
            ->select('menu_id', DB::raw('SUM(quantity) as total_sold'))
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.order_status', ['PROCESSING', 'COMPLETED', 'RECEIVED']) // Only count confirmed orders
            ->groupBy('menu_id')
            ->orderByDesc('total_sold')
            ->limit(5);

        // Apply filters
        if ($shopId) {
            $query->where('orders.shop_id', $shopId);
        }

        if ($startDate) {
            $query->where('orders.created_at', '>=', $startDate);
        }

        $results = $query->with('menu')->get();

        return [
            'datasets' => [
                [
                    'label' => 'Terjual',
                    'data' => $results->pluck('total_sold')->toArray(),
                    'backgroundColor' => [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                    ],
                    'borderColor' => [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    'borderWidth' => 1,
                ],
            ],
            'labels' => $results->map(fn ($item) => $item->menu->name ?? 'Unknown')->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar'; // Horizontal bar chart is often good for names, or just 'bar'
    }
}
