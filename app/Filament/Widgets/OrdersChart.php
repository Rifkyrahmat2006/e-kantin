<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class OrdersChart extends ChartWidget
{
    protected static ?string $heading = 'Jumlah Pesanan';
    protected static ?int $sort = 3;
    protected int | string | array $columnSpan = 1;

    public ?string $filter = '7days';

    protected function getFilters(): ?array
    {
        return [
            '7days' => '7 Hari',
            '30days' => '30 Hari',
            'thisMonth' => 'Bulan Ini',
        ];
    }

    protected function getData(): array
    {
        $user = auth()->user();
        $shopId = $user->isTenantAdmin() ? $user->shop?->id : null;

        switch ($this->filter) {
            case '30days':
                $start = Carbon::now()->subDays(30);
                $end = Carbon::now();
                break;
            case 'thisMonth':
                $start = Carbon::now()->startOfMonth();
                $end = Carbon::now();
                break;
            default:
                $start = Carbon::now()->subDays(7);
                $end = Carbon::now();
        }

        $query = Order::query()
            ->when($shopId, fn($q) => $q->where('shop_id', $shopId));

        $data = Trend::query($query)
            ->between(start: $start, end: $end)
            ->perDay()
            ->count();

        return [
            'datasets' => [
                [
                    'label' => 'Pesanan',
                    'data' => $data->map(fn(TrendValue $value) => $value->aggregate)->toArray(),
                    'backgroundColor' => [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(20, 184, 166, 0.8)',
                    ],
                    'borderColor' => 'rgb(16, 185, 129)',
                    'borderWidth' => 2,
                ],
            ],
            'labels' => $data->map(fn(TrendValue $value) => Carbon::parse($value->date)->format('d M'))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
