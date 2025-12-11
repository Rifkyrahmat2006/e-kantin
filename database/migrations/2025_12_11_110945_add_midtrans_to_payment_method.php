<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify ENUM to add MIDTRANS
        DB::statement("ALTER TABLE transactions MODIFY COLUMN payment_method ENUM('CASH', 'TRANSFER', 'EWALLET', 'MIDTRANS', 'OTHER') DEFAULT 'CASH'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove MIDTRANS from ENUM
        DB::statement("ALTER TABLE transactions MODIFY COLUMN payment_method ENUM('CASH', 'TRANSFER', 'EWALLET', 'OTHER') DEFAULT 'CASH'");
    }
};
