<?php

namespace Database\Seeders;

use App\Models\Game;
use Illuminate\Database\Seeder;

class GameSeeder extends Seeder
{
    /**
     * Seed the games table with real game data.
     * 
     * Updated December 2025 with 14 games across multiple genres:
     * - Action/FPS: Call of Duty Black Ops 6
     * - Life Simulation: The Sims 4
     * - Strategy: Civilization VI
     * - Sports: NBA 2K26
     * - Action: Devil May Cry 5
     * - Horror: Resident Evil 4
     * - MOBA: Dota 2
     * - Racing: Gran Turismo 7
     * - Plus 6 existing games
     */
    public function run(): void
    {
        $games = [
            // EXISTING GAMES
            [
                'title' => 'The Legend of Zelda: Breath of the Wild',
                'genre' => 'Action-Adventure',
                'release_date' => '2017-03-03',
                'developer' => 'Nintendo EPD',
                'description' => 'An open-world action-adventure game that redefines the Zelda series. Explore a vast kingdom, solve puzzles, and battle enemies in any order you choose.',
                'platform' => 'Nintendo Switch',
                'image_url' => '/images/games/BOTW.jpg',
                'rating' => 9.7,
            ],
            [
                'title' => 'Final Fantasy VII Rebirth',
                'genre' => 'RPG',
                'release_date' => '2024-02-29',
                'developer' => 'Square Enix',
                'description' => 'The final part of the Final Fantasy VII Remake trilogy. Continue Cloud\'s journey as he battles against the Shinra Electric Power Company and other threats.',
                'platform' => 'PlayStation 5',
                'image_url' => '/images/games/FF7 Rebirth.png',
                'rating' => 9.2,
            ],
            [
                'title' => 'Final Fantasy XVI',
                'genre' => 'RPG',
                'release_date' => '2023-06-22',
                'developer' => 'Square Enix',
                'description' => 'A new mainline Final Fantasy title featuring Clive Rosfield in a dark fantasy world. Experience epic battles with Eikon summons and an immersive narrative.',
                'platform' => 'PlayStation 5',
                'image_url' => '/images/games/Final_Fantasy_XVI.png',
                'rating' => 8.9,
            ],
            [
                'title' => 'Ghost of Tsushima',
                'genre' => 'Action-Adventure',
                'release_date' => '2020-07-17',
                'developer' => 'Sucker Punch Productions',
                'description' => 'An open-world samurai game set in 13th-century Tsushima, Japan. Take on the role of Jin Sakai and fight against the Mongol invasion using samurai sword techniques.',
                'platform' => 'PlayStation 4, PlayStation 5',
                'image_url' => '/images/games/Ghost of Tsushima.jpg',
                'rating' => 9.4,
            ],
            [
                'title' => 'God of War Ragnarök',
                'genre' => 'Action-Adventure',
                'release_date' => '2022-11-09',
                'developer' => 'Santa Monica Studio',
                'description' => 'The sequel to God of War (2018). Kratos and Atreus face the prophesied end of the world in this epic conclusion to the Norse saga.',
                'platform' => 'PlayStation 4, PlayStation 5',
                'image_url' => '/images/games/God of War Ragnarok.jpg',
                'rating' => 9.3,
            ],
            [
                'title' => 'Kingdom Hearts III',
                'genre' => 'Action RPG',
                'release_date' => '2019-01-25',
                'developer' => 'Square Enix',
                'description' => 'Sora and friends continue their adventure in this ambitious crossover featuring Disney worlds, Final Fantasy characters, and original Kingdom Hearts lore.',
                'platform' => 'PlayStation 4, Xbox One',
                'image_url' => '/images/games/Kingdom Hearts 3.jpg',
                'rating' => 8.5,
            ],
            
            // NEW GAMES - DECEMBER 2025
            [
                'title' => 'Call of Duty: Black Ops 6',
                'genre' => 'First-Person Shooter',
                'release_date' => '2024-10-25',
                'developer' => 'Treyarch',
                'description' => 'The latest entry in the Black Ops series featuring an engaging campaign set during the Gulf War, fast-paced multiplayer action, and the return of Round-Based Zombies. Experience omnimovement for enhanced player mobility.',
                'platform' => 'PC, PlayStation 5, Xbox Series X/S',
                'image_url' => '/images/games/cod-black-ops-6.jpg',
                'rating' => 8.7,
            ],
            [
                'title' => 'The Sims 4',
                'genre' => 'Life Simulation',
                'release_date' => '2014-09-02',
                'developer' => 'Maxis',
                'description' => 'Create and control people in a virtual world. Build homes, develop relationships, pursue careers, and explore a vibrant community. With dozens of expansion packs, the possibilities are endless.',
                'platform' => 'PC, PlayStation 4, PlayStation 5, Xbox One, Xbox Series X/S',
                'image_url' => '/images/games/the-sims-4.jpg',
                'rating' => 8.3,
            ],
            [
                'title' => 'Sid Meier\'s Civilization VI',
                'genre' => 'Turn-Based Strategy',
                'release_date' => '2016-10-21',
                'developer' => 'Firaxis Games',
                'description' => 'Build an empire to stand the test of time. Advance your civilization from the Stone Age to the Information Age through research, diplomacy, and warfare. Lead one of 50+ historical leaders to victory.',
                'platform' => 'PC, PlayStation 4, Xbox One, Nintendo Switch',
                'image_url' => '/images/games/civilization-vi.jpg',
                'rating' => 9.4,
            ],
            [
                'title' => 'NBA 2K26',
                'genre' => 'Sports',
                'release_date' => '2025-09-08',
                'developer' => '2K Sports',
                'description' => 'The most authentic basketball simulation returns with enhanced ProPLAY technology, realistic player animations, and deep MyCAREER and MyTEAM modes. Compete online or build your dynasty in MyGM.',
                'platform' => 'PC, PlayStation 5, Xbox Series X/S',
                'image_url' => '/images/games/nba-2k26.jpg',
                'rating' => 8.2,
            ],
            [
                'title' => 'Devil May Cry 5',
                'genre' => 'Hack and Slash',
                'release_date' => '2019-03-08',
                'developer' => 'Capcom',
                'description' => 'Stylish action returns with three playable characters: Nero, Dante, and the mysterious V. Master deep combat mechanics, pull off insane combos, and battle demonic hordes with SSS-tier style.',
                'platform' => 'PC, PlayStation 4, PlayStation 5, Xbox One, Xbox Series X/S',
                'image_url' => '/images/games/devil-may-cry-5.jpg',
                'rating' => 9.1,
            ],
            [
                'title' => 'Resident Evil 4',
                'genre' => 'Survival Horror',
                'release_date' => '2023-03-24',
                'developer' => 'Capcom',
                'description' => 'A stunning remake of the legendary survival horror classic. Leon S. Kennedy ventures to a remote European village to rescue the president\'s daughter. Modernized gameplay meets classic horror.',
                'platform' => 'PC, PlayStation 5, Xbox Series X/S',
                'image_url' => '/images/games/resident-evil-4.jpg',
                'rating' => 9.3,
            ],
            [
                'title' => 'Dota 2',
                'genre' => 'MOBA',
                'release_date' => '2013-07-09',
                'developer' => 'Valve',
                'description' => 'The premier free-to-play MOBA with over 120 heroes. Compete in 5v5 strategic battles where teamwork, skill, and game knowledge determine victory. Home to The International, esports\' biggest tournament.',
                'platform' => 'PC',
                'image_url' => '/images/games/dota-2.jpg',
                'rating' => 9.0,
            ],
            [
                'title' => 'Gran Turismo 7',
                'genre' => 'Racing Simulation',
                'release_date' => '2022-03-04',
                'developer' => 'Polyphony Digital',
                'description' => 'The ultimate driving simulator returns with stunning visuals, realistic physics, and over 400 cars. Experience legendary tracks, deep car customization, and the GT Café mode that celebrates automotive culture.',
                'platform' => 'PlayStation 4, PlayStation 5',
                'image_url' => '/images/games/gran-turismo-7.jpg',
                'rating' => 8.8,
            ],
        ];

        foreach ($games as $gameData) {
            Game::updateOrCreate(
                ['title' => $gameData['title']], // Use title as unique identifier
                $gameData // All fields to insert/update
            );
        }
        
        $this->command->info('✅ Seeded 14 games successfully!');
        $this->command->info('   - 6 existing games updated');
        $this->command->info('   - 8 new games added');
    }
}
