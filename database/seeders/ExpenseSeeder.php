<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExpenseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('expenses')->insert([
            [
                'expense_date' => now()->subDays(5)->toDateString(),
                'expense_category' => 'Bahan Baku',
                'amount' => 500000,
                'description' => 'Pembelian beras, minyak, dan bumbu dapur',
                'created_at' => now(),
            ],
            [
                'expense_date' => now()->subDays(4)->toDateString(),
                'expense_category' => 'Listrik',
                'amount' => 350000,
                'description' => 'Pembayaran tagihan listrik bulan ini',
                'created_at' => now(),
            ],
            [
                'expense_date' => now()->subDays(3)->toDateString(),
                'expense_category' => 'Gas',
                'amount' => 150000,
                'description' => 'Pembelian tabung gas 12kg',
                'created_at' => now(),
            ],
            [
                'expense_date' => now()->subDays(2)->toDateString(),
                'expense_category' => 'Bahan Baku',
                'amount' => 300000,
                'description' => 'Pembelian sayuran dan daging ayam',
                'created_at' => now(),
            ],
            [
                'expense_date' => now()->subDays(1)->toDateString(),
                'expense_category' => 'Peralatan',
                'amount' => 200000,
                'description' => 'Pembelian piring dan gelas plastik',
                'created_at' => now(),
            ],
            [
                'expense_date' => now()->toDateString(),
                'expense_category' => 'Kebersihan',
                'amount' => 100000,
                'description' => 'Pembelian sabun cuci piring dan lap',
                'created_at' => now(),
            ],
        ]);
    }
}
