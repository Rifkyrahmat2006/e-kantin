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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onUpdate('cascade')->onDelete('restrict');
            $table->foreignId('customer_id')->constrained('customers')->onUpdate('cascade')->onDelete('restrict');
            $table->decimal('amount_paid', 12, 2);
            $table->enum('payment_method', ['CASH', 'TRANSFER', 'EWALLET', 'OTHER'])->default('CASH');
            $table->enum('payment_status', ['PENDING', 'PAID', 'FAILED'])->default('PENDING');
            $table->dateTime('transaction_time')->useCurrent();
            $table->string('reference_code', 100)->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index('order_id');
            $table->index('customer_id');
            $table->index('payment_status');
            $table->index('transaction_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
