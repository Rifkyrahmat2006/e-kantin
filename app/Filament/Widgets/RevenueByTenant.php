<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Settlement;
use App\Models\Shop;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget as BaseWidget;
use Illuminate\Support\Carbon;

class RevenueByTenant extends BaseWidget
{
    protected static ?int $sort = 5;
    protected int | string | array $columnSpan = 'full';

    public static function canView(): bool
    {
        return auth()->user()->isSuperAdmin();
    }

    public function table(Table $table): Table
    {
        return $table
            ->query(Shop::query())
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Tenant')
                    ->searchable(),
                Tables\Columns\TextColumn::make('total_revenue')
                    ->label('Total Pendapatan')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->getStateUsing(function (Shop $record) {
                        return Order::where('shop_id', $record->id)
                            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
                            ->sum('total_amount');
                    }),
                Tables\Columns\TextColumn::make('month_revenue')
                    ->label('Bulan Ini')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->getStateUsing(function (Shop $record) {
                        return Order::where('shop_id', $record->id)
                            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
                            ->whereMonth('created_at', Carbon::now()->month)
                            ->whereYear('created_at', Carbon::now()->year)
                            ->sum('total_amount');
                    }),
                Tables\Columns\TextColumn::make('settled_amount')
                    ->label('Sudah Dibayar')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->getStateUsing(function (Shop $record) {
                        return Settlement::where('shop_id', $record->id)
                            ->where('status', Settlement::STATUS_COMPLETED)
                            ->sum('amount');
                    }),
                Tables\Columns\TextColumn::make('pending_amount')
                    ->label('Sisa Saldo')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->color('success')
                    ->weight('bold')
                    ->getStateUsing(function (Shop $record) {
                        $totalRevenue = Order::where('shop_id', $record->id)
                            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
                            ->sum('total_amount');
                        $totalSettled = Settlement::where('shop_id', $record->id)
                            ->whereIn('status', [Settlement::STATUS_COMPLETED, Settlement::STATUS_PROCESSING, Settlement::STATUS_PENDING])
                            ->sum('amount');
                        return max(0, $totalRevenue - $totalSettled);
                    }),
            ])
            ->actions([
                Tables\Actions\Action::make('create_settlement')
                    ->label('Buat Settlement')
                    ->icon('heroicon-o-banknotes')
                    ->color('primary')
                    ->url(fn (Shop $record) => route('filament.admin.resources.settlements.create', ['shop_id' => $record->id])),
            ]);
    }
}
