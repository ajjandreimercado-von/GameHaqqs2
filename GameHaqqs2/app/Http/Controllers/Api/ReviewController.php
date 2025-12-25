<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Review;
use App\Models\Like;
use App\Models\Comment;
use App\Services\GamificationService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Get paginated list of reviews (optimized)
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $gameId = $request->query('game_id');
        
        $query = Review::query()->with('author:id,username');
        
        if ($gameId) {
            $query->where('game_id', $gameId);
        }
        
        $reviews = $query->latest()->paginate($perPage);

        // Convert to plain arrays
        $plainData = [];
        foreach ($reviews->items() as $review) {
            $plainData[] = [
                'id' => (int) $review->id,
                'game_id' => (int) $review->game_id,
                'author_id' => (int) $review->author_id,
                'author' => $review->author ? $review->author->username : 'Unknown',
                'rating' => $review->rating ? (float) $review->rating : null,
                'pros' => $review->pros,
                'cons' => $review->cons,
                'content' => $review->content,
                'created_at' => $review->created_at,
                'updated_at' => $review->updated_at,
            ];
        }

        return response()->json([
            'data' => $plainData,
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * Show a specific review (optimized)
     */
    public function show(Review $review): JsonResponse
    {
        $plainData = [
            'id' => (int) $review->id,
            'game_id' => (int) $review->game_id,
            'author_id' => (int) $review->author_id,
            'rating' => $review->rating ? (float) $review->rating : null,
            'pros' => $review->pros,
            'cons' => $review->cons,
            'content' => $review->content,
            'created_at' => $review->created_at,
            'updated_at' => $review->updated_at,
        ];
        
        return response()->json(['data' => $plainData]);
    }

    /**
     * Update a review (author only)
     */
    public function update(Request $request, Review $review): JsonResponse
    {
        // Check if user is the author
        if (Auth::id() !== $review->author_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->validate([
            'rating' => 'sometimes|numeric|min:0|max:5',
            'pros' => 'sometimes|nullable|string|max:255',
            'cons' => 'sometimes|nullable|string|max:255',
            'content' => 'sometimes|string',
        ]);

        $review->update($data);

        return response()->json([
            'message' => 'Review updated successfully',
            'data' => $review
        ]);
    }

    /**
     * Delete a review (author or admin only)
     */
    public function destroy(Review $review): JsonResponse
    {
        $user = Auth::user();
        
        // Check if user is the author or admin
        if ($user->id !== $review->author_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Review deleted successfully'
        ]);
    }

    public function store(Request $request, Game $game, GamificationService $xp)
    {
        $data = $request->validate([
            'rating' => 'required|numeric|min:0|max:5',
            'pros' => 'nullable|string|max:255',
            'cons' => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        $authorId = Auth::id();
        if (!$authorId) return response()->json(['message' => 'Unauthenticated'], 401);

        return DB::transaction(function () use ($game, $data, $xp, $authorId) {
            $review = Review::create([
                'game_id' => $game->id,
                'rating' => $data['rating'],
                'pros' => $data['pros'] ?? null,
                'cons' => $data['cons'] ?? null,
                'content' => $data['content'],
                'author_id' => $authorId,
            ]);
            
            $xp->awardXp($authorId, 20);
            return response()->json(['review_id' => $review->id, 'xp_awarded' => 20], 201);
        });
    }

    /**
     * Get rating statistics for a specific game
     */
    public function getGameRatingStats(Request $request, $gameId): JsonResponse
    {
        try {
            // Get all reviews for this game
            $reviews = Review::where('game_id', $gameId)->get();
            
            $totalReviews = $reviews->count();
            
            // If no reviews, return empty stats
            if ($totalReviews === 0) {
                return response()->json([
                    'data' => [
                        'total_reviews' => 0,
                        'average_rating' => 0,
                        'distribution' => [
                            '5' => ['count' => 0, 'percentage' => 0],
                            '4' => ['count' => 0, 'percentage' => 0],
                            '3' => ['count' => 0, 'percentage' => 0],
                            '2' => ['count' => 0, 'percentage' => 0],
                            '1' => ['count' => 0, 'percentage' => 0],
                        ]
                    ]
                ]);
            }
            
            // Calculate average rating
            $averageRating = $reviews->avg('rating');
            
            // Calculate distribution (ratings are 0-5 scale, round to nearest star)
            $distribution = [
                '5' => 0,
                '4' => 0,
                '3' => 0,
                '2' => 0,
                '1' => 0,
            ];
            
            foreach ($reviews as $review) {
                // Round rating to nearest star (already in 0-5 scale)
                $stars = (int) round($review->rating);
                $stars = max(1, min(5, $stars)); // Ensure it's between 1-5
                $distribution[(string)$stars]++;
            }
            
            // Calculate percentages
            $distributionWithPercentages = [];
            foreach ($distribution as $stars => $count) {
                $distributionWithPercentages[$stars] = [
                    'count' => $count,
                    'percentage' => round(($count / $totalReviews) * 100)
                ];
            }
            
            return response()->json([
                'data' => [
                    'total_reviews' => $totalReviews,
                    'average_rating' => round($averageRating, 1),
                    'distribution' => $distributionWithPercentages
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch rating statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function like(Request $request, Review $review, GamificationService $xp, NotificationService $notify)
    {
        $data = $request->validate([
            // user_id must be derived from authenticated user
            'action' => 'nullable|string|in:like,unlike'
        ]);
        $action = $data['action'] ?? 'like';
        // resolve user id from auth
        $userId = Auth::id();
        if (!$userId && app()->environment('local') && request()->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in Api\\ReviewController', ['user_id' => request()->input('user_id')]);
            $userId = (int) request()->input('user_id');
        }
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);

        if ($action === 'unlike') {
            Like::where('user_id', $userId)->where('review_id', $review->id)->delete();
            return response()->json(['liked' => false]);
        }

        $like = Like::firstOrCreate(['user_id' => $userId, 'review_id' => $review->id]);
        if ($like->wasRecentlyCreated) {
            $xp->awardXp($review->author_id, 10);
            $notify->notify($review->author_id, 'like', ['entity' => 'review', 'review_id' => $review->id, 'by' => $userId]);
        }
        return response()->json(['liked' => true, 'author_xp_awarded' => 10]);
    }

    public function comment(Request $request, Review $review, NotificationService $notify)
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
            'commentable_id' => $review->id,
            'commentable_type' => Review::class,
            'content' => $data['content'],
        ]);
        
        $notify->notify($review->author_id, 'comment', ['entity' => 'review', 'review_id' => $review->id, 'comment_id' => $comment->id, 'by' => $authorId]);
        return response()->json(['comment_id' => $comment->id, 'notified_user_id' => $review->author_id], 201);
    }
}


