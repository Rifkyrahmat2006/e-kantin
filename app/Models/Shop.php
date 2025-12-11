<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Menu;
use App\Models\Order;
use Illuminate\Support\Carbon;

class Shop extends Model
{
    protected $fillable = [
        'name',
        'owner_user_id',
        'description',
        'image',
        'image_logo',
        'status',
        'opening_time',
        'closing_time',
        'bank_name',
        'bank_account_number',
        'bank_account_name',
    ];

    protected $casts = [
        'opening_time' => 'datetime:H:i',
        'closing_time' => 'datetime:H:i',
    ];

    // Status constants
    const STATUS_OPEN = 'open';
    const STATUS_CLOSED = 'closed';

    // Appends
    protected $appends = ['image_url', 'is_open_now'];

    // Accessors
    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }

    /**
     * Check if shop is currently open based on operating hours
     */
    public function getIsOpenNowAttribute(): bool
    {
        // If no operating hours set, use manual status
        if (!$this->opening_time || !$this->closing_time) {
            return $this->status === self::STATUS_OPEN;
        }

        $now = Carbon::now();
        $openTime = Carbon::parse($this->opening_time);
        $closeTime = Carbon::parse($this->closing_time);

        // Set the same date as now for comparison
        $openTime->setDate($now->year, $now->month, $now->day);
        $closeTime->setDate($now->year, $now->month, $now->day);

        // Handle overnight hours (e.g., 22:00 - 06:00)
        if ($closeTime->lessThan($openTime)) {
            // Shop closes after midnight
            return $now->greaterThanOrEqualTo($openTime) || $now->lessThan($closeTime);
        }

        return $now->between($openTime, $closeTime);
    }

    /**
     * Get effective status (considers operating hours)
     */
    public function getEffectiveStatusAttribute(): string
    {
        // Manual override takes precedence if explicitly closed
        if ($this->status === self::STATUS_CLOSED) {
            return self::STATUS_CLOSED;
        }

        return $this->is_open_now ? self::STATUS_OPEN : self::STATUS_CLOSED;
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

    public function settlements()
    {
        return $this->hasMany(Settlement::class);
    }

    /**
     * Calculate available balance (revenue - settlements)
     */
    public function getAvailableBalanceAttribute(): float
    {
        $totalRevenue = $this->orders()
            ->whereIn('order_status', ['COMPLETED', 'RECEIVED'])
            ->sum('total_amount');

        $totalSettled = $this->settlements()
            ->whereIn('status', [Settlement::STATUS_COMPLETED, Settlement::STATUS_PROCESSING, Settlement::STATUS_PENDING])
            ->sum('amount');

        return max(0, $totalRevenue - $totalSettled);
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

