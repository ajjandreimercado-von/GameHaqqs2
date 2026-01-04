<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Services\RawgApiService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GameApiController extends Controller
{
    protected RawgApiService $rawgApi;

    public function __construct(RawgApiService $rawgApi)
    {
        $this->rawgApi = $rawgApi;
    }

    /**
     * Fetch and cache games from RAWG API
     */
    public function index(Request $request): JsonResponse
    {
        $params = $request->only(['search', 'genres', 'platforms', 'ordering', 'page', 'page_size']);
        
        $data = $this->rawgApi->fetchGames($params);

        if (!$data) {
            return response()->json([
                'error' => 'Failed to fetch games from external API'
            ], 500);
        }

        return response()->json($data);
    }

    /**
     * Get a single game by RAWG ID
     */
    public function show(int $id): JsonResponse
    {
        $gameData = $this->rawgApi->fetchGameById($id);

        if (!$gameData) {
            return response()->json([
                'error' => 'Game not found'
            ], 404);
        }

        return response()->json($gameData);
    }

    /**
     * Search games
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2'
        ]);

        $data = $this->rawgApi->searchGames(
            $request->input('q'),
            $request->input('page', 1)
        );

        return response()->json($data);
    }

    /**
     * Get popular games
     */
    public function popular(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $data = $this->rawgApi->getPopularGames($limit);

        return response()->json($data);
    }

    /**
     * Get recent games
     */
    public function recent(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $data = $this->rawgApi->getRecentGames($limit);

        return response()->json($data);
    }

    /**
     * Get upcoming games
     */
    public function upcoming(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 20);
        $data = $this->rawgApi->getUpcomingGames($limit);

        return response()->json($data);
    }

    /**
     * Get games by genre
     */
    public function byGenre(Request $request, string $genre): JsonResponse
    {
        $page = $request->input('page', 1);
        $data = $this->rawgApi->getGamesByGenre($genre, $page);

        return response()->json($data);
    }

    /**
     * Get game screenshots
     */
    public function screenshots(int $id): JsonResponse
    {
        $data = $this->rawgApi->getGameScreenshots($id);

        if (!$data) {
            return response()->json([
                'error' => 'Screenshots not found'
            ], 404);
        }

        return response()->json($data);
    }

    /**
     * Import a game from RAWG into local database
     * This allows you to save specific games for features like reviews, wikis, etc.
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'rawg_id' => 'required|integer'
        ]);

        $rawgId = $request->input('rawg_id');
        
        // Check if already imported
        $existingGame = Game::where('rawg_id', $rawgId)->first();
        if ($existingGame) {
            return response()->json([
                'message' => 'Game already imported',
                'game' => $existingGame
            ]);
        }

        // Fetch from RAWG
        $gameData = $this->rawgApi->fetchGameById($rawgId);
        
        if (!$gameData) {
            return response()->json([
                'error' => 'Game not found in RAWG API'
            ], 404);
        }

        // Transform and save to database
        $game = Game::create([
            'rawg_id' => $gameData['id'],
            'title' => $gameData['name'],
            'description' => $gameData['description_raw'] ?? $gameData['description'] ?? '',
            'genre' => collect($gameData['genres'] ?? [])->pluck('name')->implode(', '),
            'developer' => collect($gameData['developers'] ?? [])->pluck('name')->first() ?? 'Unknown',
            'platform' => collect($gameData['platforms'] ?? [])->pluck('platform.name')->implode(', '),
            'release_date' => $gameData['released'] ?? null,
            'image_url' => $gameData['background_image'] ?? null,
            'rating' => $gameData['rating'] ?? 0,
            'external_data' => json_encode([
                'metacritic' => $gameData['metacritic'] ?? null,
                'playtime' => $gameData['playtime'] ?? null,
                'screenshots_count' => $gameData['screenshots_count'] ?? 0,
                'rawg_url' => $gameData['slug'] ?? null,
            ])
        ]);

        return response()->json([
            'message' => 'Game imported successfully',
            'game' => $game
        ], 201);
    }

    /**
     * Sync multiple games to local database
     */
    public function syncPopular(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 50);
        $data = $this->rawgApi->getPopularGames($limit);

        if (!$data || empty($data['results'])) {
            return response()->json(['error' => 'Failed to fetch games'], 500);
        }

        $imported = 0;
        $skipped = 0;

        DB::beginTransaction();
        try {
            foreach ($data['results'] as $gameData) {
                $exists = Game::where('rawg_id', $gameData['id'])->exists();
                
                if ($exists) {
                    $skipped++;
                    continue;
                }

                Game::create([
                    'rawg_id' => $gameData['id'],
                    'title' => $gameData['name'],
                    'description' => $gameData['description'] ?? '',
                    'genre' => collect($gameData['genres'] ?? [])->pluck('name')->implode(', '),
                    'developer' => 'Unknown', // Full details require individual API calls
                    'platform' => collect($gameData['platforms'] ?? [])->pluck('platform.name')->implode(', '),
                    'release_date' => $gameData['released'] ?? null,
                    'image_url' => $gameData['background_image'] ?? null,
                    'rating' => $gameData['rating'] ?? 0,
                ]);

                $imported++;
            }

            DB::commit();

            return response()->json([
                'message' => 'Sync completed',
                'imported' => $imported,
                'skipped' => $skipped,
                'total' => $imported + $skipped
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Sync failed: ' . $e->getMessage()], 500);
        }
    }
}
