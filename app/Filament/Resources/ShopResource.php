<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ShopResource\Pages;
use App\Filament\Resources\ShopResource\RelationManagers;
use App\Models\Shop;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class ShopResource extends Resource
{
    protected static ?string $model = Shop::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';
    protected static ?string $navigationGroup = 'Shop Management';
    protected static ?string $navigationLabel = 'Shops';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Forms\Components\Section::make('Informasi Toko')
                    ->schema([
                        Forms\Components\TextInput::make('name')
                            ->label('Nama Toko')
                            ->required()
                            ->maxLength(255),
                        Forms\Components\Select::make('owner_user_id')
                            ->label('Pemilik')
                            ->relationship('owner', 'name', fn ($query) => $query->where('role', 'TenantAdmin'))
                            ->required()
                            ->searchable()
                            ->preload(),
                        Forms\Components\Textarea::make('description')
                            ->label('Deskripsi')
                            ->maxLength(65535)
                            ->columnSpanFull(),
                        Forms\Components\FileUpload::make('image')
                            ->label('Banner Toko')
                            ->image()
                            ->directory('shops')
                            ->disk('public'),
                    ])->columns(2),

                Forms\Components\Section::make('Jam Operasional')
                    ->schema([
                        Forms\Components\TimePicker::make('opening_time')
                            ->label('Jam Buka')
                            ->seconds(false)
                            ->default('08:00'),
                        Forms\Components\TimePicker::make('closing_time')
                            ->label('Jam Tutup')
                            ->seconds(false)
                            ->default('21:00'),
                        Forms\Components\Select::make('status')
                            ->label('Status Manual')
                            ->options([
                                'open' => 'Buka (Override)',
                                'closed' => 'Tutup (Override)',
                            ])
                            ->default('open')
                            ->helperText('Status akan otomatis berdasarkan jam operasional. Pilih "Tutup" untuk menutup paksa.'),
                    ])->columns(3),

                Forms\Components\Section::make('Informasi Bank')
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
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('image')
                    ->label('Banner')
                    ->circular(),
                Tables\Columns\TextColumn::make('name')
                    ->label('Nama Toko')
                    ->searchable()
                    ->sortable(),
                Tables\Columns\TextColumn::make('owner.name')
                    ->label('Pemilik')
                    ->sortable(),
                Tables\Columns\TextColumn::make('operating_hours')
                    ->label('Jam Operasional')
                    ->getStateUsing(function (Shop $record) {
                        if (!$record->opening_time || !$record->closing_time) {
                            return '-';
                        }
                        $open = \Carbon\Carbon::parse($record->opening_time)->format('H:i');
                        $close = \Carbon\Carbon::parse($record->closing_time)->format('H:i');
                        return $open . ' - ' . $close;
                    }),
                Tables\Columns\IconColumn::make('is_open_now')
                    ->label('Status')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),
                Tables\Columns\TextColumn::make('available_balance')
                    ->label('Saldo Tersedia')
                    ->formatStateUsing(fn ($state) => 'Rp ' . number_format($state, 0, ',', '.'))
                    ->color('success')
                    ->weight('bold'),
                Tables\Columns\TextColumn::make('menus_count')
                    ->label('Menu')
                    ->counts('menus')
                    ->sortable(),
                Tables\Columns\TextColumn::make('created_at')
                    ->label('Dibuat')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('name')
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'open' => 'Buka',
                        'closed' => 'Tutup',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('create_settlement')
                    ->label('Settlement')
                    ->icon('heroicon-o-banknotes')
                    ->color('success')
                    ->url(fn (Shop $record) => route('filament.admin.resources.settlements.create', ['shop_id' => $record->id])),
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
            'index' => Pages\ListShops::route('/'),
            'create' => Pages\CreateShop::route('/create'),
            'edit' => Pages\EditShop::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return auth()->user()->isSuperAdmin();
    }
}
