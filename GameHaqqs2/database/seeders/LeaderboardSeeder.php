<?php

namespace Database\Seeders;

use App\Models\Leaderboard;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeaderboardSeeder extends Seeder
{
    public function run(): void
    {
        // Get all users and populate leaderboard for all periods
        $users = User::orderByDesc('xp')->get();
        
        if ($users->isEmpty()) {
            $this->command->info('No users found. Please run UserSeeder first.');
            return;
        }

        // Clear existing leaderboard data
        Leaderboard::truncate();

        // Populate for all periods
        $periods = ['weekly', 'monthly', 'all-time'];
        
        foreach ($periods as $period) {
            $this->command->info("Populating leaderboard for period: {$period}");
            Leaderboard::updateLeaderboard($period);
        }

        $this->command->info('Leaderboard populated successfully!');
    }
}
