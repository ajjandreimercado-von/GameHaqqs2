<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $with = [];

    protected $fillable = ['user_id','type','payload','read'];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'read' => 'boolean',
        ];
    }
}


