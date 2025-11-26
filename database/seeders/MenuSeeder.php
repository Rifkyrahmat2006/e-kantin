<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('menus')->insert([
            // Makanan Pembuka (Category 1)
            [
                'menu_category_id' => 1,
                'name' => 'Lumpia Goreng',
                'price' => 8000,
                'stock' => 50,
                'description' => 'Lumpia goreng isi sayuran segar',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 1,
                'name' => 'Tahu Isi',
                'price' => 5000,
                'stock' => 40,
                'description' => 'Tahu goreng isi sayuran dan bumbu',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Makanan Utama (Category 2)
            [
                'menu_category_id' => 2,
                'name' => 'Nasi Goreng Spesial',
                'price' => 15000,
                'stock' => 30,
                'description' => 'Nasi goreng dengan telur, ayam, dan sayuran',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 2,
                'name' => 'Mie Goreng',
                'price' => 12000,
                'stock' => 35,
                'description' => 'Mie goreng dengan sayuran dan telur',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 2,
                'name' => 'Ayam Geprek',
                'price' => 18000,
                'stock' => 25,
                'description' => 'Ayam goreng geprek dengan sambal pedas',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 2,
                'name' => 'Soto Ayam',
                'price' => 13000,
                'stock' => 20,
                'description' => 'Soto ayam kuah kuning dengan nasi',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 2,
                'name' => 'Nasi Pecel',
                'price' => 10000,
                'stock' => 30,
                'description' => 'Nasi dengan sayuran dan bumbu pecel',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Minuman (Category 3)
            [
                'menu_category_id' => 3,
                'name' => 'Es Teh Manis',
                'price' => 3000,
                'stock' => 100,
                'description' => 'Teh manis dingin segar',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 3,
                'name' => 'Es Jeruk',
                'price' => 5000,
                'stock' => 80,
                'description' => 'Jus jeruk segar dengan es',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 3,
                'name' => 'Kopi Hitam',
                'price' => 4000,
                'stock' => 60,
                'description' => 'Kopi hitam panas atau dingin',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 3,
                'name' => 'Es Campur',
                'price' => 8000,
                'stock' => 40,
                'description' => 'Es campur dengan buah dan agar-agar',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Snack & Camilan (Category 4)
            [
                'menu_category_id' => 4,
                'name' => 'Pisang Goreng',
                'price' => 5000,
                'stock' => 50,
                'description' => 'Pisang goreng crispy',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 4,
                'name' => 'Cireng',
                'price' => 6000,
                'stock' => 45,
                'description' => 'Cireng isi dengan sambal kacang',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'menu_category_id' => 4,
                'name' => 'Risoles',
                'price' => 7000,
                'stock' => 35,
                'description' => 'Risoles isi sayuran dan daging',
                'status' => 'available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
