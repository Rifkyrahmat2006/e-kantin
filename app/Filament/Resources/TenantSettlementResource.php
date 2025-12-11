<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TenantSettlementResource\Pages;
use App\Models\Settlement;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TenantSettlementResource extends Resource
{
    protected static ?string $model = Settlement::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Revenue';
    protected static ?string $navigationLabel = 'Riwayat Settlement';
    protected static ?string $modelLabel = 'Settlement';
    protected static ?string $pluralModelLabel = 'Settlements';
    protected static ?int $navigationSort = 2;

    public static function canViewAny(): bool
    {
        return auth()->user()->isTenantAdmin();
    }

    public static function canCreate(): bool
    {
        return false; // Tenant cannot create settlements
    }

    public static function canEdit($record): bool
    {
        return false; // Tenant cannot edit settlements
    }

    public static function canDelete($record): bool
    {
        return false; // Tenant cannot delete settlements
    }

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Detail Settlement')
                    ->schema([
                        Forms\Components\TextInput::make('amount')
                            ->label('Jumlah')
                            ->prefix('Rp')
                            ->disabled(),
                        Forms\Components\TextInput::make('status')
                            ->label('Status')
                            ->disabled(),
                        Forms\Components\TextInput::make('bank_name')
                            ->label('Bank')
                            ->disabled(),
                        Forms\Components\TextInput::make('bank_account_number')
                            ->label('No. Rekening')
                            ->disabled(),
                        Forms\Components\TextInput::make('bank_account_name')
                            ->label('Nama Rekening')
                            ->disabled(),
                        Forms\Components\DateTimePicker::make('processed_at')
                            ->label('Tanggal Proses')
                            ->disabled(),
                        Forms\Components\Textarea::make('notes')
                            ->label('Catatan')
                            ->disabled()
                            ->columnSpanFull(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('#')
                    ->sortable(),
                Tables\Columns\TextColumn::make('amount')
                    ->label('Jumlah')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->sortable(),
                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        Settlement::STATUS_PENDING => 'warning',
                        Settlement::STATUS_PROCESSING => 'info',
                        Settlement::STATUS_COMPLETED => 'success',
                        Settlement::STATUS_FAILED => 'danger',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        Settlement::STATUS_PENDING => 'Menunggu',
                        Settlement::STATUS_PROCESSING => 'Diproses',
                        Settlement::STATUS_COMPLETED => 'Selesai',
                        Settlement::STATUS_FAILED => 'Gagal',
                        default => $state,
                    }),
                Tables\Columns\TextColumn::make('bank_name')
                    ->label('Bank')
                    ->toggleable(),
                Tables\Columns\TextColumn::make('processed_at')
                    ->label('Tanggal Proses')
                    ->dateTime('d M Y H:i')
                    ->placeholder('-')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y')
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        Settlement::STATUS_PENDING => 'Menunggu',
                        Settlement::STATUS_PROCESSING => 'Diproses',
                        Settlement::STATUS_COMPLETED => 'Selesai',
                        Settlement::STATUS_FAILED => 'Gagal',
                    ]),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
            ])
            ->bulkActions([]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTenantSettlements::route('/'),
            'view' => Pages\ViewTenantSettlement::route('/{record}'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $user = auth()->user();
        
        return parent::getEloquentQuery()
            ->where('shop_id', $user->shop?->id);
    }
}
