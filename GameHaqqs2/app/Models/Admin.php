<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $with = [];

    protected $fillable = ['user_id','role_level'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}


