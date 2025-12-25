<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
{
    /**
     * Get paginated list of games (optimized - no auto-loading relationships).
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $games = Game::query()
            ->paginate($perPage);

        // Convert to plain arrays to prevent relationship serialization
        $plainData = [];
        foreach ($games->items() as $game) {
            $plainData[] = [
                'id' => (int) $game->id,
                'title' => (string) $game->title,
                'genre' => (string) $game->genre,
                'release_date' => $game->release_date,
                'developer' => $game->developer,
                'description' => $game->description,
                'platform' => $game->platform,
                'image_url' => $game->image_url,
                'rating' => $game->rating ? (float) $game->rating : null,
            ];
        }

        return response()->json([
            'data' => $plainData,
            'meta' => [
                'current_page' => $games->currentPage(),
                'last_page' => $games->lastPage(),
                'per_page' => $games->perPage(),
                'total' => $games->total(),
            ],
        ]);
    }

    /**
     * Get a single game (optimized - no auto-loading relationships).
     */
    public function show(Game $game): JsonResponse
    {
        $plainData = [
            'id' => (int) $game->id,
            'title' => (string) $game->title,
            'genre' => (string) $game->genre,
            'release_date' => $game->release_date,
            'developer' => $game->developer,
            'description' => $game->description,
            'platform' => $game->platform,
            'image_url' => $game->image_url,
            'rating' => $game->rating ? (float) $game->rating : null,
        ];
        
        return response()->json([
            'data' => $plainData,
        ]);
    }

    /**
     * Public index of games (no auth required) for simple web pages (optimized).
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);
        $games = Game::query()->paginate($perPage);

        // Convert to plain arrays to prevent relationship serialization
        $plainData = [];
        foreach ($games->items() as $game) {
            $plainData[] = [
                'id' => (int) $game->id,
                'title' => (string) $game->title,
                'genre' => (string) $game->genre,
                'release_date' => $game->release_date,
                'developer' => $game->developer,
                'description' => $game->description,
                'platform' => $game->platform,
                'image_url' => $game->image_url,
                'rating' => $game->rating ? (float) $game->rating : null,
            ];
        }

        return response()->json([
            'data' => $plainData,
            'meta' => [
                'current_page' => $games->currentPage(),
                'last_page' => $games->lastPage(),
                'per_page' => $games->perPage(),
                'total' => $games->total(),
            ],
        ]);
    }

    /**
     * Create a new game (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'genre' => 'required|string|max:100',
            'release_date' => 'nullable|date',
            'developer' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'platform' => 'nullable|string|max:100',
            'image_url' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'rating' => 'nullable|numeric|min:0|max:10',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('images/games'), $filename);
            $data['image_url'] = '/images/games/' . $filename;
        }

        $game = Game::create($data);

        return response()->json([
            'message' => 'Game created successfully',
            'data' => $game
        ], 201);
    }

    /**
     * Update a game (Admin only)
     */
    public function update(Request $request, Game $game): JsonResponse
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'genre' => 'sometimes|string|max:100',
            'release_date' => 'sometimes|nullable|date',
            'developer' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'platform' => 'sometimes|nullable|string|max:100',
            'image_url' => 'sometimes|nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'rating' => 'sometimes|nullable|numeric|min:0|max:10',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($game->image_url && file_exists(public_path($game->image_url))) {
                @unlink(public_path($game->image_url));
            }
            
            $image = $request->file('image');
            $filename = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('images/games'), $filename);
            $data['image_url'] = '/images/games/' . $filename;
        }

        $game->update($data);

        return response()->json([
            'message' => 'Game updated successfully',
            'data' => $game
        ]);
    }

    /**
     * Delete a game (Admin only)
     */
    public function destroy(Game $game): JsonResponse
    {
        $game->delete();

        return response()->json([
            'message' => 'Game deleted successfully'
        ]);
    }

    /**
     * Add or remove a game from user favorites.
     */
    public function favorite(Request $request, Game $game): JsonResponse
    {
        $data = $request->validate([
                // user_id must come from authenticated user; do not trust client
            'action' => 'nullable|string|in:add,remove'
        ]);
        
        $action = $data['action'] ?? 'add';

        // Determine user id from session (server authority). Local env fallback allowed but logged.
    $userId = Auth::id();
        if (!$userId && app()->environment('local') && request()->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in Api\\GameController', ['user_id' => request()->input('user_id')]);
            $userId = (int) request()->input('user_id');
        }

        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($action === 'remove') {
            Favorite::where('user_id', $userId)
                ->where('game_id', $game->id)
                ->delete();

            return response()->json(['favorited' => false]);
        }

        Favorite::firstOrCreate([
            'user_id' => $userId,
            'game_id' => $game->id,
        ]);
        
        return response()->json(['favorited' => true]);
    }
}


