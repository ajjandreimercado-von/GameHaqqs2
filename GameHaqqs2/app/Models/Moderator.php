<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Moderator extends Model
{
    use HasFactory;

    protected $with = [];

    protected $fillable = ['user_id','assigned_category'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}


