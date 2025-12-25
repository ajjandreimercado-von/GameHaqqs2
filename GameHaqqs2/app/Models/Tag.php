<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $with = [];

    protected $fillable = ['name'];
    protected $primaryKey = 'id';
    public $timestamps = false;

    public function games(): BelongsToMany
    {
        return $this->belongsToMany(Game::class, 'game_tags')
                    ->withTimestamps();
    }
}


