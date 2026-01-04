<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RawgApiService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected int $cacheTime = 3600; // Cache for 1 hour

    public function __construct()
    {
        $this->apiKey = config('services.rawg.api_key');
        $this->baseUrl = config('services.rawg.base_url');
    }

    /**
     * Fetch games from RAWG API with pagination and filters
     */
    public function fetchGames(array $params = [])
    {
        $defaultParams = [
            'key' => $this->apiKey,
            'page_size' => $params['page_size'] ?? 20,
            'page' => $params['page'] ?? 1,
        ];

        // Merge additional filters
        $queryParams = array_merge($defaultParams, array_filter([
            'search' => $params['search'] ?? null,
            'genres' => $params['genres'] ?? null,
            'platforms' => $params['platforms'] ?? null,
            'ordering' => $params['ordering'] ?? '-rating',
            'dates' => $params['dates'] ?? null,
        ]));

        $cacheKey = 'rawg_games_' . md5(json_encode($queryParams));

        return Cache::remember($cacheKey, $this->cacheTime, function () use ($queryParams) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/games", $queryParams);

                if ($response->successful()) {
                    return $response->json();
                }

                Log::error('RAWG API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);

                return null;
            } catch (\Exception $e) {
                Log::error('RAWG API Exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    /**
     * Fetch a single game by ID from RAWG API
     */
    public function fetchGameById(int $gameId)
    {
        $cacheKey = "rawg_game_{$gameId}";

        return Cache::remember($cacheKey, $this->cacheTime * 24, function () use ($gameId) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/games/{$gameId}", [
                    'key' => $this->apiKey
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            } catch (\Exception $e) {
                Log::error('RAWG API Exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    /**
     * Search games by query
     */
    public function searchGames(string $query, int $page = 1)
    {
        return $this->fetchGames([
            'search' => $query,
            'page' => $page,
            'page_size' => 20
        ]);
    }

    /**
     * Get games by genre
     */
    public function getGamesByGenre(string $genre, int $page = 1)
    {
        return $this->fetchGames([
            'genres' => $genre,
            'page' => $page
        ]);
    }

    /**
     * Get popular games (highly rated)
     */
    public function getPopularGames(int $limit = 20)
    {
        return $this->fetchGames([
            'page_size' => $limit,
            'ordering' => '-rating,-metacritic'
        ]);
    }

    /**
     * Get recently released games
     */
    public function getRecentGames(int $limit = 20)
    {
        $oneMonthAgo = now()->subMonth()->format('Y-m-d');
        $today = now()->format('Y-m-d');

        return $this->fetchGames([
            'page_size' => $limit,
            'dates' => "{$oneMonthAgo},{$today}",
            'ordering' => '-released'
        ]);
    }

    /**
     * Get upcoming games
     */
    public function getUpcomingGames(int $limit = 20)
    {
        $today = now()->format('Y-m-d');
        $threeMonthsLater = now()->addMonths(3)->format('Y-m-d');

        return $this->fetchGames([
            'page_size' => $limit,
            'dates' => "{$today},{$threeMonthsLater}",
            'ordering' => 'released'
        ]);
    }

    /**
     * Get game screenshots
     */
    public function getGameScreenshots(int $gameId)
    {
        $cacheKey = "rawg_game_{$gameId}_screenshots";

        return Cache::remember($cacheKey, $this->cacheTime * 24, function () use ($gameId) {
            try {
                $response = Http::timeout(10)->get("{$this->baseUrl}/games/{$gameId}/screenshots", [
                    'key' => $this->apiKey
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                return null;
            } catch (\Exception $e) {
                Log::error('RAWG API Exception', ['message' => $e->getMessage()]);
                return null;
            }
        });
    }

    /**
     * Clear cache for specific game or all games
     */
    public function clearCache(?int $gameId = null)
    {
        if ($gameId) {
            Cache::forget("rawg_game_{$gameId}");
            Cache::forget("rawg_game_{$gameId}_screenshots");
        } else {
            // Clear all RAWG cache
            Cache::flush();
        }
    }
}
