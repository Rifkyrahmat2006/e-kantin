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
        'image',
        'image_logo',
        'status',
    ];

    // Status constants
    const STATUS_OPEN = 'open';
    const STATUS_CLOSED = 'closed';

    // Appends
    protected $appends = ['image_url'];

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }

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

    protected static function booted()
    {
        static::saved(function ($shop) {
            if ($shop->wasChanged('image') && $shop->image) {
                try {
                    $path = storage_path('app/public/' . $shop->image);
                    if (file_exists($path)) {
                        \Spatie\LaravelImageOptimizer\Facades\ImageOptimizer::optimize($path);
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Shop image optimization failed: ' . $e->getMessage());
                }
            }
        });
    }
}
