<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\TipAndTrick;
use App\Models\Like;
use App\Models\Comment;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class TipController extends Controller
{
    /**
     * Get paginated list of tips (optimized)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $gameId = $request->query('game_id');
        
        $query = TipAndTrick::query()->with('author:id,username');
        
        if ($gameId) {
            $query->where('game_id', $gameId);
        }
        
        $tips = $query->latest()->paginate($perPage);

        // Convert to plain arrays
        $plainData = [];
        foreach ($tips->items() as $tip) {
            $plainData[] = [
                'id' => (int) $tip->id,
                'game_id' => (int) $tip->game_id,
                'author_id' => (int) $tip->author_id,
                'author' => $tip->author ? $tip->author->username : 'Unknown',
                'title' => (string) $tip->title,
                'content' => (string) $tip->content,
                'created_at' => $tip->created_at,
                'updated_at' => $tip->updated_at,
            ];
        }

        return response()->json([
            'data' => $plainData,
            'meta' => [
                'current_page' => $tips->currentPage(),
                'last_page' => $tips->lastPage(),
                'per_page' => $tips->perPage(),
                'total' => $tips->total(),
            ],
        ]);
    }

    /**
     * Show a specific tip (optimized)
     */
    public function show(TipAndTrick $tip): JsonResponse
    {
        $plainData = [
            'id' => (int) $tip->id,
            'game_id' => (int) $tip->game_id,
            'author_id' => (int) $tip->author_id,
            'title' => (string) $tip->title,
            'content' => (string) $tip->content,
            'created_at' => $tip->created_at,
            'updated_at' => $tip->updated_at,
        ];
        
        return response()->json(['data' => $plainData]);
    }

    /**
     * Update a tip (author only)
     */
    public function update(Request $request, TipAndTrick $tip): JsonResponse
    {
        // Check if user is the author
        if (Auth::id() !== $tip->author_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'title' => 'sometimes|string|max:100',
            'content' => 'sometimes|string',
        ]);

        $tip->update($data);

        return response()->json([
            'message' => 'Tip updated successfully',
            'data' => $tip
        ]);
    }

    /**
     * Delete a tip (author or admin only)
     */
    public function destroy(TipAndTrick $tip): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user is the author or admin
        if ($user->id !== $tip->author_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tip->delete();

        return response()->json([
            'message' => 'Tip deleted successfully'
        ]);
    }

    public function store(Request $request, Game $game, GamificationService $xp)
    {
        $data = $request->validate([
            'title' => 'required|string|max:100',
            'content' => 'required|string',
        ]);
        $authorId = Auth::id();
        if (!$authorId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    return DB::transaction(function () use ($game, $data, $xp, $authorId) {
            $tip = TipAndTrick::create([
                'game_id' => $game->id,
                'title' => $data['title'],
                'content' => $data['content'],
                    'author_id' => $authorId,
                ]);
                $xp->awardXp($authorId, 20);
            return response()->json(['tip_id' => $tip->id, 'xp_awarded' => 20], 201);
        });
    }

    public function like(Request $request, TipAndTrick $tip, GamificationService $xp, NotificationService $notify)
    {
        $data = $request->validate([
            'action' => 'nullable|string|in:like,unlike'
        ]);
        $action = $data['action'] ?? 'like';
        // resolve user id from auth
        $userId = Auth::id();
        if (!$userId && app()->environment('local') && request()->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in Api\\TipController', ['user_id' => request()->input('user_id')]);
            $userId = (int) request()->input('user_id');
        }
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);

        if ($action === 'unlike') {
            Like::where('user_id', $userId)->where('tip_id', $tip->id)->delete();
            return response()->json(['liked' => false]);
        }

        $like = Like::firstOrCreate(['user_id' => $userId, 'tip_id' => $tip->id]);
        if ($like->wasRecentlyCreated) {
            $xp->awardXp($tip->author_id, 10);
            $notify->notify($tip->author_id, 'like', ['entity' => 'tip', 'tip_id' => $tip->id, 'by' => $userId]);
        }
        return response()->json(['liked' => true, 'author_xp_awarded' => 10]);
    }

    public function comment(Request $request, TipAndTrick $tip, NotificationService $notify)
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
            'commentable_id' => $tip->id,
            'commentable_type' => TipAndTrick::class,
            'content' => $data['content'],
        ]);
        
        $notify->notify($tip->author_id, 'comment', ['entity' => 'tip', 'tip_id' => $tip->id, 'comment_id' => $comment->id, 'by' => $authorId]);
        return response()->json(['comment_id' => $comment->id, 'notified_user_id' => $tip->author_id], 201);
    }
}


