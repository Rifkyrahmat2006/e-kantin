<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menus';

    protected $fillable = [
        'shop_id',
        'menu_category_id',
        'name',
        'price',
        'stock',
        'description',
        'image',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'stock' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Status constants
    const STATUS_AVAILABLE = 'available';
    const STATUS_UNAVAILABLE = 'unavailable';

    // Appends
    protected $appends = ['image_url'];

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }

    // Relationships
    public function category()
    {
        return $this->belongsTo(MenuCategory::class, 'menu_category_id');
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    protected static function booted()
    {
        static::saved(function ($menu) {
            if ($menu->wasChanged('image') && $menu->image) {
                try {
                    // Assuming default filesystem is 'public'
                    $path = storage_path('app/public/' . $menu->image);
                    if (file_exists($path)) {
                        \Spatie\LaravelImageOptimizer\Facades\ImageOptimizer::optimize($path);
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Menu image optimization failed: ' . $e->getMessage());
                }
            }
        });
    }
}
