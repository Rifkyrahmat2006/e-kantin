<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('customers')->insert([
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@example.com',
                'password' => Hash::make('password123'),
                'phone' => '081234567890',
                'table_number' => 'A1',
                'notes' => 'Tidak pakai sambal',
                'created_at' => now(),
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti@example.com',
                'password' => Hash::make('password123'),
                'phone' => '081234567891',
                'table_number' => 'B3',
                'notes' => null,
                'created_at' => now(),
            ],
            [
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad@example.com',
                'password' => Hash::make('password123'),
                'phone' => '081234567892',
                'table_number' => 'C2',
                'notes' => 'Extra pedas',
                'created_at' => now(),
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi@example.com',
                'password' => Hash::make('password123'),
                'phone' => '081234567893',
                'table_number' => 'A5',
                'notes' => 'Tanpa MSG',
                'created_at' => now(),
            ],
            [
                'name' => 'Rudi Hermawan',
                'email' => 'rudi@example.com',
                'password' => Hash::make('password123'),
                'phone' => '081234567894',
                'table_number' => 'D1',
                'notes' => null,
                'created_at' => now(),
            ],
        ]);
    }
}
