<?php

namespace App\Services;

use App\Models\User;
use App\Models\Achievement;
use App\Models\UserAchievement;
use Illuminate\Support\Facades\DB;

class AchievementService
{
    // Check and unlock achievements based on user stats
    public function checkAndUnlockAchievements(User $user): array
    {
        $newlyUnlocked = [];

        $unlockedIds = $user->achievements()->pluck('achievements.id');
        $achievements = Achievement::whereNotIn('id', $unlockedIds)->get();

        foreach ($achievements as $achievement) {
            if ($this->meetsRequirements($user, $achievement)) {
                $this->unlockAchievement($user, $achievement);
                $newlyUnlocked[] = $achievement;
            }
        }

        return $newlyUnlocked;
    }

    private function meetsRequirements(User $user, Achievement $achievement): bool
    {
        $criteria = $achievement->criteria;
        
        if (!$criteria || !isset($criteria['type'])) {
            return false;
        }

        switch ($criteria['type']) {
            case 'account_created':
                return true; // Always unlocked on account creation
                
            case 'level_reached':
                return $user->level >= ($criteria['level'] ?? 1);
                
            case 'comments_made':
                return DB::table('comments')
                    ->where('author_id', $user->id)
                    ->count() >= ($criteria['count'] ?? 1);
                
            case 'posts_created':
                return DB::table('posts')
                    ->where('user_id', $user->id)
                    ->count() >= ($criteria['count'] ?? 1);
                
            case 'helpful_comments':
                return DB::table('comments')
                    ->where('author_id', $user->id)
                    ->count() >= ($criteria['count'] ?? 1);
                
            case 'leaderboard_rank':
                $rank = DB::table('users')
                    ->where('role', 'user')
                    ->where('xp', '>', $user->xp)
                    ->count() + 1;
                return $rank <= ($criteria['max_rank'] ?? 10);
                
            default:
                return false;
        }
    }

    public function unlockAchievement(User $user, Achievement $achievement): UserAchievement
    {
        $userAchievement = UserAchievement::create([
            'user_id' => $user->id,
            'achievement_id' => $achievement->id,
            'unlocked_at' => now(),
            'progress' => 100,
        ]);

        $user->addXP($achievement->xp_reward);

        return $userAchievement;
    }

    public function getUserAchievements(User $user): array
    {
        $allAchievements = Achievement::all();
        $userAchievements = UserAchievement::where('user_id', $user->id)
            ->get()
            ->keyBy('achievement_id');

        return $allAchievements->map(function ($achievement) use ($userAchievements) {
            $userAchievement = $userAchievements->get($achievement->id);
            $unlocked = $userAchievement !== null;
            
            return [
                'id' => $achievement->id,
                'key' => $achievement->key,
                'name' => $achievement->name,
                'description' => $achievement->description,
                'icon' => $achievement->icon,
                'rarity' => $achievement->rarity,
                'xp_reward' => $achievement->xp_reward,
                'unlocked' => $unlocked,
                'unlocked_at' => $unlocked ? $userAchievement->unlocked_at->toISOString() : null,
                'progress' => $unlocked ? 100 : $this->calculateProgress($achievement),
            ];
        })->toArray();
    }

    /**
     * Calculate progress towards achievement
     */
    private function calculateProgress(Achievement $achievement): int
    {
        // Simplified - in real implementation, calculate based on current stats
        return 0;
    }
}
