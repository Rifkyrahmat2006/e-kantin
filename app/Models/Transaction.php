<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $table = 'transactions';

    protected $fillable = [
        'order_id',
        'customer_id',
        'amount_paid',
        'payment_method',
        'payment_status',
        'transaction_time',
        'reference_code',
    ];

    protected $casts = [
        'amount_paid' => 'decimal:2',
        'transaction_time' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Payment method constants
    const METHOD_CASH = 'CASH';
    const METHOD_TRANSFER = 'TRANSFER';
    const METHOD_EWALLET = 'EWALLET';
    const METHOD_MIDTRANS = 'MIDTRANS';
    const METHOD_OTHER = 'OTHER';

    // Payment status constants
    const STATUS_PENDING = 'PENDING';
    const STATUS_PAID = 'PAID';
    const STATUS_FAILED = 'FAILED';

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
