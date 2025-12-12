<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory, SoftDeletes;

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
    protected $appends = ['image_url', 'average_rating', 'reviews_count', 'likes_count', 'total_sold'];

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }

    public function getAverageRatingAttribute()
    {
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function getReviewsCountAttribute()
    {
        return $this->reviews()->count();
    }

    public function getLikesCountAttribute()
    {
        return $this->likes()->count();
    }

    public function getTotalSoldAttribute()
    {
        // Use a more efficient query with join instead of whereHas
        return \App\Models\OrderItem::where('menu_id', $this->id)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.order_status', ['PROCESSING', 'COMPLETED', 'RECEIVED'])
            ->sum('order_items.quantity');
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

    public function reviews()
    {
        return $this->hasMany(MenuReview::class);
    }

    public function likes()
    {
        return $this->hasMany(MenuLike::class);
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
