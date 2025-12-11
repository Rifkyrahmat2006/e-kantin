<?php

namespace App\Models;

use Filament\Models\Contracts\HasAvatar;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable implements HasAvatar
{
    use HasFactory, HasApiTokens, Notifiable;

    protected $table = 'customers';
    
    // Only created_at, no updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'table_number',
        'notes',
        'avatar',
        'google_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    // Automatically hash password when setting
    public function setPasswordAttribute($value)
    {
        if ($value) {
            $this->attributes['password'] = bcrypt($value);
        }
    }

    // Relationships
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function getFilamentAvatarUrl(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://')) {
            return $this->avatar;
        }

        return url('storage/' . $this->avatar);
    }
}
