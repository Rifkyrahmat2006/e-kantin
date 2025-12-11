<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Filament\Resources\OrderResource\RelationManagers;
use App\Models\Order;
use App\Models\Customer;
use App\Models\Shop;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Notifications\Notification;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Sales';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Order Information')
                    ->schema([
                        Forms\Components\Select::make('customer_id')
                            ->label('Customer')
                            ->options(Customer::pluck('name', 'id'))
                            ->searchable()
                            ->required()
                            ->disabled(),
                        Forms\Components\Select::make('shop_id')
                            ->label('Shop')
                            ->options(Shop::pluck('name', 'id'))
                            ->searchable()
                            ->disabled()
                            ->hidden(fn () => auth()->user()->isTenantAdmin()),
                        Forms\Components\DateTimePicker::make('order_time')
                            ->label('Order Time')
                            ->disabled(),
                        Forms\Components\TextInput::make('total_amount')
                            ->label('Total Amount')
                            ->prefix('Rp')
                            ->numeric()
                            ->disabled(),
                    ])->columns(2),
                
                Forms\Components\Section::make('Order Status')
                    ->schema([
                        Forms\Components\Select::make('order_status')
                            ->label('Status')
                            ->options([
                                Order::STATUS_PENDING => 'Pending',
                                Order::STATUS_PROCESSING => 'Processing',
                                Order::STATUS_COMPLETED => 'Completed',
                                Order::STATUS_RECEIVED => 'Received',
                                Order::STATUS_CANCELLED => 'Cancelled',
                            ])
                            ->required()
                            ->native(false),
                        Forms\Components\Textarea::make('notes')
                            ->label('Notes')
                            ->maxLength(255)
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('Order #')
                    ->sortable()
                    ->prefix('#'),
                Tables\Columns\TextColumn::make('shop.name')
                    ->label('Shop')
                    ->sortable()
                    ->hidden(fn () => auth()->user()->isTenantAdmin()),
                Tables\Columns\TextColumn::make('customer.name')
                    ->label('Customer')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('customer.table_number')
                    ->label('Table')
                    ->badge()
                    ->color('gray'),
                Tables\Columns\TextColumn::make('order_time')
                    ->label('Time')
                    ->dateTime('d M Y H:i')
                    ->sortable(),
                Tables\Columns\TextColumn::make('total_amount')
                    ->label('Total')
                    ->money('IDR')
                    ->sortable(),
                Tables\Columns\TextColumn::make('order_status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        Order::STATUS_PENDING => 'warning',
                        Order::STATUS_PROCESSING => 'info',
                        Order::STATUS_COMPLETED => 'success',
                        Order::STATUS_RECEIVED => 'success',
                        Order::STATUS_CANCELLED => 'danger',
                        default => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('order_status')
                    ->options([
                        Order::STATUS_PENDING => 'Pending',
                        Order::STATUS_PROCESSING => 'Processing',
                        Order::STATUS_COMPLETED => 'Completed',
                        Order::STATUS_RECEIVED => 'Received',
                        Order::STATUS_CANCELLED => 'Cancelled',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('process')
                    ->label('Proses')
                    ->icon('heroicon-o-arrow-path')
                    ->color('info')
                    ->visible(fn (Order $record) => $record->order_status === Order::STATUS_PENDING)
                    ->requiresConfirmation()
                    ->modalHeading('Proses Pesanan?')
                    ->modalDescription('Pesanan akan diproses dan customer akan diberitahu.')
                    ->action(function (Order $record) {
                        $record->update(['order_status' => Order::STATUS_PROCESSING]);
                        Notification::make()
                            ->title('Pesanan sedang diproses')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('complete')
                    ->label('Selesai')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->visible(fn (Order $record) => $record->order_status === Order::STATUS_PROCESSING)
                    ->requiresConfirmation()
                    ->modalHeading('Selesaikan Pesanan?')
                    ->modalDescription('Pesanan akan ditandai selesai dan siap diserahkan ke customer.')
                    ->action(function (Order $record) {
                        $record->update(['order_status' => Order::STATUS_COMPLETED]);
                        Notification::make()
                            ->title('Pesanan selesai')
                            ->success()
                            ->send();
                    }),
                Tables\Actions\Action::make('cancel')
                    ->label('Batal')
                    ->icon('heroicon-o-x-circle')
                    ->color('danger')
                    ->visible(fn (Order $record) => in_array($record->order_status, [Order::STATUS_PENDING, Order::STATUS_PROCESSING]))
                    ->requiresConfirmation()
                    ->modalHeading('Batalkan Pesanan?')
                    ->modalDescription('Pesanan akan dibatalkan. Tindakan ini tidak dapat diurungkan.')
                    ->action(function (Order $record) {
                        $record->update(['order_status' => Order::STATUS_CANCELLED]);
                        Notification::make()
                            ->title('Pesanan dibatalkan')
                            ->warning()
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
            RelationManagers\OrderItemsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'create' => Pages\CreateOrder::route('/create'),
            'edit' => Pages\EditOrder::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery();

        if (auth()->user()->isTenantAdmin()) {
            $query->where('shop_id', auth()->user()->shop?->id);
        }

        return $query;
    }
}
