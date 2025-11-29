<?php

namespace Database\Seeders;

use App\Models\Shop;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class ShopSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Shop 1: Warung Bu Tini
        $owner1 = User::firstOrCreate(
            ['email' => 'eddy@kantin.com'],
            [
                'name' => 'Eddy',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => User::ROLE_TENANT_ADMIN,
            ]
        );

        Shop::firstOrCreate(
            ['name' => 'Warung Bu Tini'],
            [
                'owner_user_id' => $owner1->id,
                'description' => 'Menyediakan aneka masakan rumahan yang lezat dan higienis.',
                'status' => Shop::STATUS_OPEN,
            ]
        );

        // Shop 2: Pojok Jus
        $owner2 = User::firstOrCreate(
            ['email' => 'jus@kantin.com'],
            [
                'name' => 'Mas Budi (Jus)',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => User::ROLE_TENANT_ADMIN,
            ]
        );

        Shop::firstOrCreate(
            ['name' => 'Pojok Jus'],
            [
                'owner_user_id' => $owner2->id,
                'description' => 'Aneka jus buah segar dan minuman dingin.',
                'status' => Shop::STATUS_OPEN,
            ]
        );

        // Shop 3: Snack Corner
        $owner3 = User::firstOrCreate(
            ['email' => 'snack@kantin.com'],
            [
                'name' => 'Mba Sari (Snack)',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => User::ROLE_TENANT_ADMIN,
            ]
        );

        Shop::firstOrCreate(
            ['name' => 'Snack Corner'],
            [
                'owner_user_id' => $owner3->id,
                'description' => 'Camilan ringan dan gorengan hangat.',
                'status' => Shop::STATUS_OPEN,
            ]
        );
    }
}
