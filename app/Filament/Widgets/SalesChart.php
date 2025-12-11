<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class SalesChart extends ChartWidget
{
    protected static ?string $heading = 'Grafik Penjualan';
    protected static ?int $sort = 2;
    protected int | string | array $columnSpan = 'full';

    public ?string $filter = '7days';

    protected function getFilters(): ?array
    {
        return [
            '7days' => '7 Hari Terakhir',
            '30days' => '30 Hari Terakhir',
            'thisMonth' => 'Bulan Ini',
            'lastMonth' => 'Bulan Lalu',
            '3months' => '3 Bulan Terakhir',
        ];
    }

    protected function getData(): array
    {
        $user = auth()->user();
        $shopId = $user->isTenantAdmin() ? $user->shop?->id : null;

        // Determine date range based on filter
        switch ($this->filter) {
            case '30days':
                $start = Carbon::now()->subDays(30);
                $end = Carbon::now();
                $interval = 'day';
                break;
            case 'thisMonth':
                $start = Carbon::now()->startOfMonth();
                $end = Carbon::now();
                $interval = 'day';
                break;
            case 'lastMonth':
                $start = Carbon::now()->subMonth()->startOfMonth();
                $end = Carbon::now()->subMonth()->endOfMonth();
                $interval = 'day';
                break;
            case '3months':
                $start = Carbon::now()->subMonths(3);
                $end = Carbon::now();
                $interval = 'week';
                break;
            default: // 7days
                $start = Carbon::now()->subDays(7);
                $end = Carbon::now();
                $interval = 'day';
        }

        // Build query
        $query = Order::query()
            ->when($shopId, fn($q) => $q->where('shop_id', $shopId))
            ->whereIn('order_status', ['PROCESSING', 'COMPLETED', 'RECEIVED']);

        // Get sales trend
        $data = Trend::query($query)
            ->between(start: $start, end: $end)
            ->perDay()
            ->sum('total_amount');

        return [
            'datasets' => [
                [
                    'label' => 'Pendapatan (Rp)',
                    'data' => $data->map(fn(TrendValue $value) => $value->aggregate)->toArray(),
                    'backgroundColor' => 'rgba(59, 130, 246, 0.1)',
                    'borderColor' => 'rgb(59, 130, 246)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
            ],
            'labels' => $data->map(fn(TrendValue $value) => Carbon::parse($value->date)->format('d M'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => [
                'legend' => [
                    'display' => true,
                ],
            ],
            'scales' => [
                'y' => [
                    'beginAtZero' => true,
                    'ticks' => [
                        'callback' => "function(value) { return 'Rp ' + value.toLocaleString('id-ID'); }",
                    ],
                ],
            ],
        ];
    }
}
