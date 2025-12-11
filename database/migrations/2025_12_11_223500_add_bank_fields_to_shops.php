<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('shops', 'bank_name')) {
            Schema::table('shops', function (Blueprint $table) {
                $table->string('bank_name')->nullable()->after('logo');
            });
        }
        
        if (!Schema::hasColumn('shops', 'bank_account_number')) {
            Schema::table('shops', function (Blueprint $table) {
                $table->string('bank_account_number')->nullable()->after('bank_name');
            });
        }
        
        if (!Schema::hasColumn('shops', 'bank_account_name')) {
            Schema::table('shops', function (Blueprint $table) {
                $table->string('bank_account_name')->nullable()->after('bank_account_number');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shops', function (Blueprint $table) {
            if (Schema::hasColumn('shops', 'bank_name')) {
                $table->dropColumn('bank_name');
            }
            if (Schema::hasColumn('shops', 'bank_account_number')) {
                $table->dropColumn('bank_account_number');
            }
            if (Schema::hasColumn('shops', 'bank_account_name')) {
                $table->dropColumn('bank_account_name');
            }
        });
    }
};
