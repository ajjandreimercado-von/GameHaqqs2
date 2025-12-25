<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $with = [];

    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'role',
        'xp',
        'level',
        'badges',
        'last_login_at',
        'last_login_ip',
        'login_count',
        'phone_number',
        'address',
        'is_banned',
        'muted_until',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'badges' => 'array',
        'xp' => 'integer',
        'level' => 'integer',
        'last_login_at' => 'datetime',
        'login_count' => 'integer',
        'is_banned' => 'boolean',
        'muted_until' => 'datetime',
    ];

    public function isMuted(): bool
    {
        return $this->muted_until && $this->muted_until->isFuture();
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'author_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'author_id');
    }

    public function wikis(): HasMany
    {
        return $this->hasMany(Wiki::class, 'author_id');
    }

    public function tipsAndTricks(): HasMany
    {
        return $this->hasMany(TipAndTrick::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'author_id');
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function achievements(): BelongsToMany
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
                    ->withPivot('unlocked_at', 'progress')
                    ->withTimestamps();
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'recipient_id');
    }

    public function leaderboardEntries(): HasMany
    {
        return $this->hasMany(Leaderboard::class);
    }

    // Award XP and auto-level (100 XP per level)
    public function addXP(int $amount): void
    {
        $this->xp += $amount;
        $newLevel = floor($this->xp / 100) + 1;
        
        if ($newLevel > $this->level) {
            $this->level = $newLevel;
        }
        
        $this->save();
    }

    public function addBadge(string $badgeName): void
    {
        $badges = $this->badges ?? [];
        
        if (!in_array($badgeName, $badges)) {
            $badges[] = $badgeName;
            $this->badges = $badges;
            $this->save();
        }
    }
}
