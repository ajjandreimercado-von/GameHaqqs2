<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Models\Game;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Get paginated list of tags
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 20);
        $search = $request->query('search');
        
        $query = Tag::withCount('games');
        
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }
        
        $tags = $query->orderBy('games_count', 'desc')
                     ->orderBy('name')
                     ->paginate($perPage);

        return response()->json([
            'data' => $tags->items(),
            'meta' => [
                'current_page' => $tags->currentPage(),
                'last_page' => $tags->lastPage(),
                'per_page' => $tags->perPage(),
                'total' => $tags->total(),
            ],
        ]);
    }

    /**
     * Show a specific tag with games
     */
    public function show(Tag $tag): JsonResponse
    {
        $tag->load(['games' => function ($query) {
            $query->with(['reviews', 'wikis', 'tipsAndTricks']);
        }]);
        
        return response()->json(['data' => $tag]);
    }

    /**
     * Create a new tag (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:50|unique:tags',
            'description' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag = Tag::create($data);

        return response()->json([
            'message' => 'Tag created successfully',
            'data' => $tag
        ], 201);
    }

    /**
     * Update a tag (Admin only)
     */
    public function update(Request $request, Tag $tag): JsonResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:50|unique:tags,name,' . $tag->id,
            'description' => 'sometimes|nullable|string|max:255',
            'color' => 'sometimes|nullable|string|max:7|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag->update($data);

        return response()->json([
            'message' => 'Tag updated successfully',
            'data' => $tag
        ]);
    }

    /**
     * Delete a tag (Admin only)
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        return response()->json([
            'message' => 'Tag deleted successfully'
        ]);
    }

    /**
     * Attach tag to game (Admin only)
     */
    public function attachToGame(Request $request, Tag $tag, Game $game): JsonResponse
    {
        $game->tags()->syncWithoutDetaching([$tag->id]);

        return response()->json([
            'message' => 'Tag attached to game successfully',
            'data' => [
                'tag' => $tag,
                'game' => $game
            ]
        ]);
    }

    /**
     * Detach tag from game (Admin only)
     */
    public function detachFromGame(Request $request, Tag $tag, Game $game): JsonResponse
    {
        $game->tags()->detach($tag->id);

        return response()->json([
            'message' => 'Tag detached from game successfully'
        ]);
    }

    /**
     * Get games by tag
     */
    public function games(Tag $tag, Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        
        $games = $tag->games()
                    ->with(['reviews', 'wikis', 'tipsAndTricks', 'tags'])
                    ->paginate($perPage);

        return response()->json([
            'data' => $games->items(),
            'meta' => [
                'current_page' => $games->currentPage(),
                'last_page' => $games->lastPage(),
                'per_page' => $games->perPage(),
                'total' => $games->total(),
            ],
        ]);
    }
}
