<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    use HasFactory;

    protected $with = [];

    protected $table = 'leaderboard';
    
    protected $fillable = ['user_id', 'rank', 'xp', 'level', 'period', 'calculated_at'];

    protected function casts(): array
    {
        return [
            'calculated_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function updateLeaderboard($period = 'weekly')
    {
        self::where('period', $period)->delete();

        $users = User::orderByDesc('xp')
            ->limit(100)
            ->get(['id', 'username', 'xp', 'level']);

        $entries = [];
        foreach ($users as $index => $user) {
            $entries[] = [
                'user_id' => $user->id,
                'rank' => $index + 1,
                'xp' => $user->xp,
                'level' => $user->level,
                'period' => $period,
                'calculated_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        self::insert($entries);
    }
}
