<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Filament admin user
        User::firstOrCreate(
            ['email' => 'admin@kantin.com'],
            [
                'name' => 'Admin Kantin',
                'password' => Hash::make('admin123'),
                'email_verified_at' => now(),
                'role' => User::ROLE_SUPER_ADMIN,
            ]
        );

        // Seed in order to respect foreign key constraints
        $this->call([
            AdminSeeder::class,
            ShopSeeder::class,
            MenuCategorySeeder::class,
            MenuSeeder::class,
            CustomerSeeder::class,
            ExpenseSeeder::class,
        ]);
    }
}
