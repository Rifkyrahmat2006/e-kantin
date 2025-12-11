<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SettlementResource\Pages;
use App\Models\Settlement;
use App\Models\Shop;
use App\Models\Order;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Notifications\Notification;
use Illuminate\Support\Carbon;

class SettlementResource extends Resource
{
    protected static ?string $model = Settlement::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Revenue';
    protected static ?string $navigationLabel = 'Settlements';
    protected static ?int $navigationSort = 1;

    public static function canViewAny(): bool
    {
        return auth()->user()->isSuperAdmin();
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Settlement Details')
                    ->schema([
                        Forms\Components\Select::make('shop_id')
                            ->label('Tenant/Shop')
                            ->options(Shop::pluck('name', 'id'))
                            ->required()
                            ->searchable()
                            ->reactive()
                            ->afterStateUpdated(function ($state, callable $set) {
                                if ($state) {
                                    $pendingAmount = self::calculatePendingAmount($state);
                                    $set('amount', $pendingAmount);
                                }
                            }),
                        Forms\Components\TextInput::make('amount')
                            ->label('Jumlah Settlement')
                            ->prefix('Rp')
                            ->numeric()
                            ->required(),
                        Forms\Components\Select::make('status')
                            ->options([
                                Settlement::STATUS_PENDING => 'Pending',
                                Settlement::STATUS_PROCESSING => 'Processing',
                                Settlement::STATUS_COMPLETED => 'Completed',
                                Settlement::STATUS_FAILED => 'Failed',
                            ])
                            ->default(Settlement::STATUS_PENDING)
                            ->required(),
                    ])->columns(3),
                    
                Forms\Components\Section::make('Bank Information')
                    ->schema([
                        Forms\Components\TextInput::make('bank_name')
                            ->label('Nama Bank')
                            ->maxLength(100),
                        Forms\Components\TextInput::make('bank_account_number')
                            ->label('Nomor Rekening')
                            ->maxLength(50),
                        Forms\Components\TextInput::make('bank_account_name')
                            ->label('Nama Pemilik Rekening')
                            ->maxLength(100),
                    ])->columns(3),
                    
                Forms\Components\Section::make('Additional Info')
                    ->schema([
                        Forms\Components\Textarea::make('notes')
                            ->label('Catatan')
                            ->maxLength(500)
                            ->columnSpanFull(),
                        Forms\Components\DateTimePicker::make('processed_at')
                            ->label('Tanggal Proses')
                            ->visible(fn ($record) => $record && $record->status !== Settlement::STATUS_PENDING),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('#')
                    ->sortable(),
                Tables\Columns\TextColumn::make('shop.name')
                    ->label('Tenant')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Jumlah')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        Settlement::STATUS_PENDING => 'warning',
                        Settlement::STATUS_PROCESSING => 'info',
                        Settlement::STATUS_COMPLETED => 'success',
                        Settlement::STATUS_FAILED => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('bank_name')
                    ->label('Bank')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('processed_at')
                    ->label('Diproses')
                    ->dateTime('d M Y H:i')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        Settlement::STATUS_PENDING => 'Pending',
                        Settlement::STATUS_PROCESSING => 'Processing',
                        Settlement::STATUS_COMPLETED => 'Completed',
                        Settlement::STATUS_FAILED => 'Failed',
                    ]),
                Tables\Filters\SelectFilter::make('shop_id')
                    ->label('Tenant')
                    ->options(Shop::pluck('name', 'id')),
            ])
            ->actions([
                Tables\Actions\Action::make('process')
                    ->label('Proses')
                    ->icon('heroicon-o-arrow-path')
                    ->color('info')
                    ->visible(fn (Settlement $record) => $record->status === Settlement::STATUS_PENDING)
                    ->requiresConfirmation()
                    ->action(function (Settlement $record) {
                        $record->update([
                            'status' => Settlement::STATUS_PROCESSING,
                        ]);
                        Notification::make()
                            ->title('Settlement sedang diproses')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('complete')
                    ->label('Selesai')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Settlement $record) => $record->status === Settlement::STATUS_PROCESSING)
                    ->requiresConfirmation()
                    ->action(function (Settlement $record) {
                        $record->update([
                            'status' => Settlement::STATUS_COMPLETED,
                            'processed_at' => now(),
                        ]);
                        Notification::make()
                            ->title('Settlement selesai')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSettlements::route('/'),
            'create' => Pages\CreateSettlement::route('/create'),
            'edit' => Pages\EditSettlement::route('/{record}/edit'),
        ];
    }

    /**
     * Calculate pending amount for a shop (revenue not yet settled)
     */
    public static function calculatePendingAmount(int $shopId): float
    {
        // Total revenue from completed orders
        $totalRevenue = Order::where('shop_id', $shopId)
            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
            ->sum('total_amount');

        // Total already settled
        $totalSettled = Settlement::where('shop_id', $shopId)
            ->whereIn('status', [Settlement::STATUS_COMPLETED, Settlement::STATUS_PROCESSING, Settlement::STATUS_PENDING])
            ->sum('amount');

        return max(0, $totalRevenue - $totalSettled);
    }
}
