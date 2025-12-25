<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Wiki;
use App\Models\Like;
use App\Models\Comment;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class WikiController extends Controller
{
    /**
     * Get paginated list of wikis (optimized)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $gameId = $request->query('game_id');
        
        $query = Wiki::query();
        
        if ($gameId) {
            $query->where('game_id', $gameId);
        }
        
        $wikis = $query->latest()->paginate($perPage);

        // Convert to plain arrays
        $plainData = [];
        foreach ($wikis->items() as $wiki) {
            $plainData[] = [
                'id' => (int) $wiki->id,
                'game_id' => (int) $wiki->game_id,
                'author_id' => (int) $wiki->author_id,
                'title' => (string) $wiki->title,
                'content' => (string) $wiki->content,
                'category' => $wiki->category,
                'created_at' => $wiki->created_at,
                'updated_at' => $wiki->updated_at,
            ];
        }

        return response()->json([
            'data' => $plainData,
            'meta' => [
                'current_page' => $wikis->currentPage(),
                'last_page' => $wikis->lastPage(),
                'per_page' => $wikis->perPage(),
                'total' => $wikis->total(),
            ],
        ]);
    }

    /**
     * Show a specific wiki (optimized)
     */
    public function show(Wiki $wiki): JsonResponse
    {
        $plainData = [
            'id' => (int) $wiki->id,
            'game_id' => (int) $wiki->game_id,
            'author_id' => (int) $wiki->author_id,
            'title' => (string) $wiki->title,
            'content' => (string) $wiki->content,
            'category' => $wiki->category,
            'created_at' => $wiki->created_at,
            'updated_at' => $wiki->updated_at,
        ];
        
        return response()->json(['data' => $plainData]);
    }

    /**
     * Create a new wiki entry
     */
    public function store(Request $request, Game $game, GamificationService $xp): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string|max:100',
        ]);
        
        $authorId = Auth::id();
        if (!$authorId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return DB::transaction(function () use ($game, $data, $xp, $authorId) {
            $wiki = Wiki::create([
                'game_id' => $game->id,
                'title' => $data['title'],
                'content' => $data['content'],
                'category' => $data['category'] ?? null,
                'author_id' => $authorId,
            ]);
            
            $xp->awardXp($authorId, 25);
            
            return response()->json([
                'message' => 'Wiki created successfully',
                'data' => $wiki,
                'xp_awarded' => 25
            ], 201);
        });
    }

    /**
     * Update a wiki (author only)
     */
    public function update(Request $request, Wiki $wiki): JsonResponse
    {
        // Check if user is the author
        if (Auth::id() !== $wiki->author_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'category' => 'sometimes|nullable|string|max:100',
        ]);

        $wiki->update($data);

        return response()->json([
            'message' => 'Wiki updated successfully',
            'data' => $wiki
        ]);
    }

    /**
     * Delete a wiki (author or admin only)
     */
    public function destroy(Wiki $wiki): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user is the author or admin
        if ($user->id !== $wiki->author_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $wiki->delete();

        return response()->json([
            'message' => 'Wiki deleted successfully'
        ]);
    }

    /**
     * Like/unlike a wiki
     */
    public function like(Request $request, Wiki $wiki, GamificationService $xp, NotificationService $notify): JsonResponse
    {
        $data = $request->validate([
            'action' => 'nullable|string|in:like,unlike'
        ]);
        
        $action = $data['action'] ?? 'like';
        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($action === 'unlike') {
            Like::where('user_id', $userId)->where('wiki_id', $wiki->id)->delete();
            return response()->json(['liked' => false]);
        }

        $like = Like::firstOrCreate(['user_id' => $userId, 'wiki_id' => $wiki->id]);
        
        if ($like->wasRecentlyCreated) {
            $xp->awardXp($wiki->author_id, 10);
            $notify->notify($wiki->author_id, 'like', [
                'entity' => 'wiki', 
                'wiki_id' => $wiki->id, 
                'by' => $userId
            ]);
        }
        
        return response()->json(['liked' => true, 'author_xp_awarded' => 10]);
    }

    /**
     * Comment on a wiki
     */
    public function comment(Request $request, Wiki $wiki, NotificationService $notify): JsonResponse
    {
        $data = $request->validate([
            'content' => 'required|string',
        ]);
        
        $authorId = Auth::id();
        if (!$authorId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        $comment = Comment::create([
            'author_id' => $authorId,
            'commentable_id' => $wiki->id,
            'commentable_type' => Wiki::class,
            'content' => $data['content'],
        ]);
        
        $notify->notify($wiki->author_id, 'comment', [
            'entity' => 'wiki', 
            'wiki_id' => $wiki->id, 
            'comment_id' => $comment->id, 
            'by' => $authorId
        ]);
        
        return response()->json([
            'message' => 'Comment added successfully',
            'data' => $comment
        ], 201);
    }
}
