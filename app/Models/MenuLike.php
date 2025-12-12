<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuLike extends Model
{
    // Only created_at, no updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'customer_id',
        'menu_id',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}
