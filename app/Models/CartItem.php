<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'menu_id',
        'quantity',
    ];

    public function user()
    {
        return $this->belongsTo(Customer::class, 'user_id');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class);
    }
}
