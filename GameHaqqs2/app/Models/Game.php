<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Game extends Model
{
    use HasFactory;

    protected $with = [];

    protected $fillable = [
        'title',
        'genre',
        'release_date',
        'developer',
        'description',
        'platform',
        'image_url',
        'rating',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wikis(): HasMany
    {
        return $this->hasMany(Wiki::class);
    }

    public function tipsAndTricks(): HasMany
    {
        return $this->hasMany(TipAndTrick::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'game_tags')
            ->withTimestamps();
    }

    public function comments()
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function leaderboardEntries(): HasMany
    {
        return $this->hasMany(Leaderboard::class);
    }
}
