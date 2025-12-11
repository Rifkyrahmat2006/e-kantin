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
        // Column and index already exist, this migration is just for tracking
        // Skip if already exists to avoid duplicate column error
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('orders', 'payment_group_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropColumn('payment_group_id');
            });
        }
    }
};
