<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Achievement;

class AchievementsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $achievements = [
            [
                'key' => 'champion',
                'name' => 'Champion',
                'description' => 'Reach top 10 on leaderboard',
                'icon' => '👑',
                'rarity' => 'Legendary',
                'xp_reward' => 1000,
                'criteria' => ['type' => 'leaderboard_rank', 'max_rank' => 10],
            ],
            [
                'key' => 'social_butterfly',
                'name' => 'Social Butterfly',
                'description' => 'Make 10 comments',
                'icon' => '🦋',
                'rarity' => 'Uncommon',
                'xp_reward' => 100,
                'criteria' => ['type' => 'comments_made', 'count' => 10],
            ],
            [
                'key' => 'rising_star',
                'name' => 'Rising Star',
                'description' => 'Reach level 5',
                'icon' => '⭐',
                'rarity' => 'Common',
                'xp_reward' => 250,
                'criteria' => ['type' => 'level_reached', 'level' => 5],
            ],
            [
                'key' => 'elite_gamer',
                'name' => 'Elite Gamer',
                'description' => 'Reach level 10',
                'icon' => '🎮',
                'rarity' => 'Rare',
                'xp_reward' => 500,
                'criteria' => ['type' => 'level_reached', 'level' => 10],
            ],
            [
                'key' => 'top_contributor',
                'name' => 'Top Contributor',
                'description' => 'Post 50 times',
                'icon' => '📝',
                'rarity' => 'Epic',
                'xp_reward' => 500,
                'criteria' => ['type' => 'posts_created', 'count' => 50],
            ],
            [
                'key' => 'community_hero',
                'name' => 'Community Hero',
                'description' => '100 helpful comments',
                'icon' => '💚',
                'rarity' => 'Legendary',
                'xp_reward' => 1000,
                'criteria' => ['type' => 'helpful_comments', 'count' => 100],
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['key' => $achievement['key']],
                $achievement
            );
        }
    }
}
