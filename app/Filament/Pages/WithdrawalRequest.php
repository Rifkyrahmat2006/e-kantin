<?php

namespace App\Filament\Pages;

use App\Models\Order;
use App\Models\Settlement;
use Filament\Pages\Page;
use Filament\Forms\Form;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Notifications\Notification;
use Illuminate\Support\Carbon;

class WithdrawalRequest extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-up-tray';
    protected static ?string $navigationGroup = 'Revenue';
    protected static ?string $navigationLabel = 'Tarik Saldo';
    protected static ?int $navigationSort = 3;
    protected static string $view = 'filament.pages.withdrawal-request';

    public ?array $data = [];

    public static function canAccess(): bool
    {
        return auth()->user()->isTenantAdmin();
    }

    public function mount(): void
    {
        $shop = auth()->user()->shop;
        
        $this->form->fill([
            'bank_name' => $shop?->bank_name ?? '',
            'bank_account_number' => $shop?->bank_account_number ?? '',
            'bank_account_name' => $shop?->bank_account_name ?? '',
        ]);
    }

    public function form(Form $form): Form
    {
        $availableBalance = $this->getAvailableBalance();

        return $form
            ->schema([
                Section::make('Saldo Anda')
                    ->schema([
                        Placeholder::make('available_balance')
                            ->label('Saldo Tersedia')
                            ->content(fn () => 'Rp ' . number_format($availableBalance, 0, ',', '.')),
                        Placeholder::make('pending_withdrawals')
                            ->label('Dalam Proses')
                            ->content(fn () => 'Rp ' . number_format($this->getPendingWithdrawals(), 0, ',', '.')),
                    ])->columns(2),

                Section::make('Informasi Rekening')
                    ->schema([
                        Select::make('bank_name')
                            ->label('Nama Bank')
                            ->options([
                                'BCA' => 'BCA',
                                'BNI' => 'BNI',
                                'BRI' => 'BRI',
                                'Mandiri' => 'Mandiri',
                                'CIMB Niaga' => 'CIMB Niaga',
                                'Permata' => 'Permata',
                                'Danamon' => 'Danamon',
                                'BSI' => 'BSI',
                                'BTN' => 'BTN',
                                'BTPN' => 'BTPN',
                                'Maybank' => 'Maybank',
                                'OCBC NISP' => 'OCBC NISP',
                                'Jenius' => 'Jenius',
                                'Jago' => 'Jago',
                                'SeaBank' => 'SeaBank',
                                'Lainnya' => 'Lainnya',
                            ])
                            ->required()
                            ->searchable(),
                        TextInput::make('bank_account_number')
                            ->label('Nomor Rekening')
                            ->required()
                            ->maxLength(50),
                        TextInput::make('bank_account_name')
                            ->label('Nama Pemilik Rekening')
                            ->required()
                            ->maxLength(100),
                    ])->columns(3),

                Section::make('Jumlah Penarikan')
                    ->schema([
                        TextInput::make('amount')
                            ->label('Jumlah yang Ditarik')
                            ->prefix('Rp')
                            ->numeric()
                            ->required()
                            ->minValue(10000)
                            ->maxValue($availableBalance)
                            ->helperText('Minimum Rp 10.000. Maksimal Rp ' . number_format($availableBalance, 0, ',', '.')),
                    ]),
            ])
            ->statePath('data');
    }

    public function submit(): void
    {
        $data = $this->form->getState();
        $availableBalance = $this->getAvailableBalance();

        if ($data['amount'] > $availableBalance) {
            Notification::make()
                ->title('Saldo tidak mencukupi')
                ->danger()
                ->send();
            return;
        }

        $shop = auth()->user()->shop;

        // Update shop's bank info
        $shop->update([
            'bank_name' => $data['bank_name'],
            'bank_account_number' => $data['bank_account_number'],
            'bank_account_name' => $data['bank_account_name'],
        ]);

        // Create withdrawal request (settlement)
        Settlement::create([
            'shop_id' => $shop->id,
            'amount' => $data['amount'],
            'status' => Settlement::STATUS_PENDING,
            'bank_name' => $data['bank_name'],
            'bank_account_number' => $data['bank_account_number'],
            'bank_account_name' => $data['bank_account_name'],
            'notes' => 'Withdrawal request from tenant dashboard',
        ]);

        Notification::make()
            ->title('Permintaan penarikan berhasil dikirim')
            ->body('Admin akan memproses permintaan Anda dalam 1-3 hari kerja.')
            ->success()
            ->send();

        // Reset form
        $this->form->fill([
            'bank_name' => $data['bank_name'],
            'bank_account_number' => $data['bank_account_number'],
            'bank_account_name' => $data['bank_account_name'],
            'amount' => null,
        ]);
    }

    protected function getAvailableBalance(): float
    {
        $shopId = auth()->user()->shop?->id;

        if (!$shopId) return 0;

        $totalRevenue = Order::where('shop_id', $shopId)
            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
            ->sum('total_amount');

        $totalSettled = Settlement::where('shop_id', $shopId)
            ->whereIn('status', [Settlement::STATUS_COMPLETED, Settlement::STATUS_PROCESSING, Settlement::STATUS_PENDING])
            ->sum('amount');

        return max(0, $totalRevenue - $totalSettled);
    }

    protected function getPendingWithdrawals(): float
    {
        $shopId = auth()->user()->shop?->id;

        if (!$shopId) return 0;

        return Settlement::where('shop_id', $shopId)
            ->whereIn('status', [Settlement::STATUS_PENDING, Settlement::STATUS_PROCESSING])
            ->sum('amount');
    }
}
