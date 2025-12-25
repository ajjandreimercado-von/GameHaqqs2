<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Like;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Get paginated list of comments (optimized)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $commentableType = $request->query('commentable_type');
        $commentableId = $request->query('commentable_id');
        
        $query = Comment::query();
        
        if ($commentableType && $commentableId) {
            $query->where('commentable_type', $commentableType)
                  ->where('commentable_id', $commentableId);
        }
        
        $comments = $query->latest()->paginate($perPage);

        // Convert to plain arrays
        $plainData = [];
        foreach ($comments->items() as $comment) {
            $plainData[] = [
                'id' => (int) $comment->id,
                'author_id' => (int) $comment->author_id,
                'parent_id' => $comment->parent_id ? (int) $comment->parent_id : null,
                'commentable_id' => (int) $comment->commentable_id,
                'commentable_type' => (string) $comment->commentable_type,
                'content' => (string) $comment->content,
                'created_at' => $comment->created_at,
                'updated_at' => $comment->updated_at,
            ];
        }

        return response()->json([
            'data' => $plainData,
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    /**
     * Show a specific comment (optimized)
     */
    public function show(Comment $comment): JsonResponse
    {
        $plainData = [
            'id' => (int) $comment->id,
            'author_id' => (int) $comment->author_id,
            'parent_id' => $comment->parent_id ? (int) $comment->parent_id : null,
            'commentable_id' => (int) $comment->commentable_id,
            'commentable_type' => (string) $comment->commentable_type,
            'content' => (string) $comment->content,
            'created_at' => $comment->created_at,
            'updated_at' => $comment->updated_at,
        ];
        
        return response()->json(['data' => $plainData]);
    }

    /**
     * Update a comment (author only)
     */
    public function update(Request $request, Comment $comment): JsonResponse
    {
        // Check if user is the author
        if (Auth::id() !== $comment->author_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'content' => 'required|string',
        ]);

        $comment->update($data);

        return response()->json([
            'message' => 'Comment updated successfully',
            'data' => $comment
        ]);
    }

    /**
     * Delete a comment (author or admin only)
     */
    public function destroy(Comment $comment): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user is the author or admin
        if ($user->id !== $comment->author_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully'
        ]);
    }

    /**
     * Like/unlike a comment
     */
    public function like(Request $request, Comment $comment, GamificationService $xp, NotificationService $notify): JsonResponse
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
            Like::where('user_id', $userId)->where('comment_id', $comment->id)->delete();
            return response()->json(['liked' => false]);
        }

        $like = Like::firstOrCreate(['user_id' => $userId, 'comment_id' => $comment->id]);
        
        if ($like->wasRecentlyCreated) {
            $xp->awardXp($comment->author_id, 5);
            $notify->notify($comment->author_id, 'like', [
                'entity' => 'comment', 
                'comment_id' => $comment->id, 
                'by' => $userId
            ]);
        }
        
        return response()->json(['liked' => true, 'author_xp_awarded' => 5]);
    }
}
