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
        Schema::table('customers', function (Blueprint $table) {
            $table->string('email')->unique()->after('name');
            $table->string('password')->after('email');
            $table->string('phone', 15)->nullable()->after('password');
            $table->timestamp('email_verified_at')->nullable()->after('phone');
            $table->rememberToken()->after('email_verified_at');
            $table->string('table_number', 10)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['email', 'password', 'phone', 'email_verified_at', 'remember_token']);
            $table->string('table_number', 10)->nullable(false)->change();
        });
    }
};
