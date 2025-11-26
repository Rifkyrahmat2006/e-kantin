<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Menu;
use App\Models\Order;

class Shop extends Model
{
    protected $fillable = [
        'name',
        'owner_user_id',
        'description',
        'image_logo',
        'status',
    ];

    // Status constants
    const STATUS_OPEN = 'open';
    const STATUS_CLOSED = 'closed';

    // Relationships
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_user_id');
    }

    public function menus()
    {
        return $this->hasMany(Menu::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
