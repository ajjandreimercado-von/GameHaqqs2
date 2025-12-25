<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FakeUsersSeeder extends Seeder
{
    /**
     * Generate 50 fake users that strictly match the database schema.
     * 
     * SCHEMA CONSTRAINTS (from migrations):
     * - name: string (varchar 255), required
     * - email: string (varchar 255), required, unique
     * - username: string (varchar 255), required, unique
     * - password: string (varchar 255), required
     * - role: string (varchar 255), default 'user'
     * - xp: integer, default 0
     * - level: integer, default 1
     * - badges: json, nullable
     * - email_verified_at: timestamp, nullable
     * - last_login_at: timestamp, nullable
     * - last_login_ip: string (varchar 255), nullable
     * - login_count: integer, default 0
     * - phone_number: string (varchar 255), nullable
     * - address: string (varchar 255), nullable
     * - muted_until: timestamp, nullable
     * - is_banned: boolean, default false
     * - remember_token: string (varchar 100), nullable
     * - timestamps: created_at, updated_at
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();
        
        // Role distribution: mostly users, some moderators, few admins
        $roles = [
            'user' => 40,      // 40 regular users (80%)
            'moderator' => 7,  // 7 moderators (14%)
            'admin' => 3,      // 3 admins (6%)
        ];
        
        $usersData = [];
        $emailsUsed = [];
        $usernamesUsed = [];
        
        // Generate data for each role
        foreach ($roles as $role => $count) {
            for ($i = 0; $i < $count; $i++) {
                // Generate unique email
                do {
                    $email = $faker->unique()->safeEmail();
                } while (in_array($email, $emailsUsed));
                $emailsUsed[] = $email;
                
                // Generate unique username (max 80 chars from User model)
                do {
                    $username = $faker->userName();
                    // Ensure username length doesn't exceed varchar(255)
                    if (strlen($username) > 80) {
                        $username = substr($username, 0, 80);
                    }
                } while (in_array($username, $usernamesUsed));
                $usernamesUsed[] = $username;
                
                // Generate realistic XP and level based on role
                $xp = match($role) {
                    'admin' => $faker->numberBetween(50000, 100000),
                    'moderator' => $faker->numberBetween(10000, 50000),
                    'user' => $faker->numberBetween(0, 20000),
                };
                
                // Level calculation (assuming 1000 XP per level)
                $level = max(1, intval($xp / 1000));
                
                // Generate badges array (0-5 badges based on level)
                $badgeCount = min($level, $faker->numberBetween(0, 5));
                $possibleBadges = [
                    'early_adopter', 'contributor', 'expert', 'helper',
                    'veteran', 'leader', 'champion', 'guru', 'master'
                ];
                $badges = $badgeCount > 0 
                    ? $faker->randomElements($possibleBadges, $badgeCount) 
                    : [];
                
                // 80% of users have verified email
                $emailVerifiedAt = $faker->boolean(80) 
                    ? $faker->dateTimeBetween('-1 year', 'now') 
                    : null;
                
                // 70% of users have logged in at least once
                $hasLoggedIn = $faker->boolean(70);
                $lastLoginAt = $hasLoggedIn 
                    ? $faker->dateTimeBetween('-30 days', 'now')
                    : null;
                
                $lastLoginIp = $hasLoggedIn 
                    ? $faker->ipv4() 
                    : null;
                
                $loginCount = $hasLoggedIn 
                    ? $faker->numberBetween(1, 200) 
                    : 0;
                
                // 30% have phone numbers
                $phoneNumber = $faker->boolean(30) 
                    ? $faker->phoneNumber() 
                    : null;
                
                // 20% have addresses
                $address = $faker->boolean(20) 
                    ? $faker->address() 
                    : null;
                
                // 5% of users are temporarily muted (future date)
                $mutedUntil = $faker->boolean(5) 
                    ? $faker->dateTimeBetween('now', '+7 days')
                    : null;
                
                // 2% of users are banned
                $isBanned = $faker->boolean(2);
                
                $usersData[] = [
                    'name' => $faker->name(),
                    'email' => $email,
                    'username' => $username,
                    'password' => Hash::make('password123'), // All fake users have same password for testing
                    'role' => $role,
                    'xp' => $xp,
                    'level' => $level,
                    'badges' => json_encode($badges), // Must be JSON string for database
                    'email_verified_at' => $emailVerifiedAt,
                    'last_login_at' => $lastLoginAt,
                    'last_login_ip' => $lastLoginIp,
                    'login_count' => $loginCount,
                    'phone_number' => $phoneNumber,
                    'address' => $address,
                    'muted_until' => $mutedUntil,
                    'is_banned' => $isBanned,
                    'remember_token' => $hasLoggedIn ? Str::random(10) : null,
                    'created_at' => $faker->dateTimeBetween('-1 year', '-1 month'),
                    'updated_at' => $faker->dateTimeBetween('-1 month', 'now'),
                ];
            }
        }
        
        // Bulk insert for performance (avoids 50 individual queries)
        User::insert($usersData);
        
        $this->command->info('✅ Created 50 fake users:');
        $this->command->info("   - 40 regular users");
        $this->command->info("   - 7 moderators");
        $this->command->info("   - 3 admins");
        $this->command->info("   - All passwords: password123");
    }
}
