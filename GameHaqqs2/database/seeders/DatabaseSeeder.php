<?php

namespace Database\Seeders;

use App\Models\{User, Game, Review, Wiki, TipAndTrick, Admin, Moderator, UserRole, Leaderboard};
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
	/**
	 * Seed the application's database.
	 */
	public function run(): void
	{
		// Seed achievements first
		$this->call(AchievementsSeeder::class);

        // Users
		$users = collect(range(1, 20))->map(fn ($i) => User::create([
			'username' => 'user'.$i,
			'name' => 'User '.$i,
			'email' => "user{$i}@example.test",
			'password' => Hash::make('password'),
			'xp' => rand(0, 5000),
			'level' => rand(1, 20),
			'badges' => ['rookie'],
			'role' => 'user', // Set default role
		]));

        // Admins (3) and Moderators (5)
        // Set up admin users
        $adminUsers = $users->take(3);
        foreach ($adminUsers as $u) {
            Admin::firstOrCreate(['user_id' => $u->id], ['role_level' => rand(1,3)]);
            UserRole::firstOrCreate(['user_id' => $u->id, 'role' => 'admin']);
            $u->update(['role' => 'admin']); // Update main user role
        }

        // Set up moderator users
        $moderatorUsers = $users->slice(3, 5);
        foreach ($moderatorUsers as $u) {
            Moderator::firstOrCreate(['user_id' => $u->id], ['assigned_category' => 'general']);
            UserRole::firstOrCreate(['user_id' => $u->id, 'role' => 'moderator']);
            $u->update(['role' => 'moderator']); // Update main user role
        }

        // Populate leaderboard table with existing user data
        Leaderboard::updateLeaderboard('weekly');
        Leaderboard::updateLeaderboard('monthly');
        Leaderboard::updateLeaderboard('all-time');

		// Seed real games from the GameSeeder (replaces 10 mock "Game 1-10" entries)
		$this->call(GameSeeder::class);

		// Get the real games that were just seeded
		$games = Game::all();

		// Add reviews, wikis, and tips for each real game
		foreach ($games as $game) {
            foreach (range(1, 2) as $n) {
				Review::create([
					'game_id' => $game->id,
					'rating' => rand(35, 50) / 10, // Realistic ratings for great games (3.5-5.0)
					'pros' => 'Excellent gameplay and story',
					'cons' => 'Some minor performance issues',
					'content' => "A comprehensive review of {$game->title} detailing its strengths and weaknesses.",
					'author_id' => $users->random()->id,
				]);
			}

			foreach (range(1, 1) as $n) {
				Wiki::create([
					'game_id' => $game->id,
					'title' => "{$game->title} Strategy Guide",
					'content' => "Comprehensive guide for {$game->title} including tips, tricks, and strategies for success.",
					'author_id' => $users->random()->id,
				]);
			}

			foreach (range(1, 1) as $n) {
				TipAndTrick::create([
					'game_id' => $game->id,
					'title' => "Essential Tips for {$game->title}",
					'content' => "Useful tips and tricks to enhance your experience with {$game->title}.",
					'author_id' => $users->random()->id,
				]);
			}
		}
	}
}
