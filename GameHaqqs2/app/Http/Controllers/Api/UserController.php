<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * List all users (Admin only) – safe for Postman
     */
    public function index(Request $request)
    {
        // Maximum 20 per page to avoid huge response
        $perPage = min($request->query('per_page', 20), 20);
        $page = max((int) $request->query('page', 1), 1);
        $offset = ($page - 1) * $perPage;

        // Get total count
        $total = User::count();
        $lastPage = (int) ceil($total / $perPage);

        // Only select essential fields and explicitly prevent relationship loading
        $users = User::select('id', 'name', 'email', 'username', 'role', 'xp', 'level')
                     ->without(['posts', 'reviews', 'wikis', 'tipsAndTricks', 'comments', 'likes', 'favorites', 'notifications', 'leaderboardEntries'])
                     ->offset($offset)
                     ->limit($perPage)
                     ->get();

        // Convert to plain arrays IMMEDIATELY to prevent any relationship serialization
        $plainData = [];
        foreach ($users as $user) {
            $plainData[] = [
                'id' => (int) $user->id,
                'name' => (string) $user->name,
                'email' => (string) $user->email,
                'username' => (string) $user->username,
                'role' => (string) $user->role,
                'xp' => (int) $user->xp,
                'level' => (int) $user->level,
            ];
        }

        // Build response array with ONLY primitive types (no Eloquent objects)
        $response = [
            'current_page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => $lastPage,
            'data' => $plainData,
        ];

        // Encode to JSON string directly and return as raw response
        $json = json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        // Log the response size for debugging
        Log::info('UserController@index response size: ' . strlen($json) . ' bytes');

        return response($json, 200, [
            'Content-Type' => 'application/json; charset=UTF-8',
        ]);
    }

    /**
     * Show a single user (authorized users only)
     * - Users can view themselves
     * - Admins can view anyone
     */
    public function show(User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Check authorization: user can view themselves or admin can view anyone
        if ($authenticatedUser->id !== $user->id && $authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'role' => $user->role,
            'xp' => $user->xp,
            'level' => $user->level,
            'is_banned' => $user->is_banned,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }

    /**
     * Show user's recent activity (authorized users only)
     * - Users can view their own activity
     * - Admins can view anyone's activity
     */
    public function activity(User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Check authorization: user can view themselves or admin can view anyone
        if ($authenticatedUser->id !== $user->id && $authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        // Note: This assumes you have an activities relationship defined
        // If not, you might want to create this from posts, reviews, etc.
        $activities = $user->posts()
                           ->orWhereHas('reviews')
                           ->latest()
                           ->limit(50)
                           ->get(['id', 'title', 'created_at']); // only select minimal fields

        return response()->json($activities);
    }

    /**
     * Show user's favorite games (authorized users only)
     * - Users can view their own favorites
     * - Admins can view anyone's favorites
     */
    public function favorites(User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Check authorization: user can view themselves or admin can view anyone
        if ($authenticatedUser->id !== $user->id && $authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        // Eager load game data with favorites
        $favorites = $user->favorites()
                          ->with(['game:id,title,genre,platform,image_url,rating'])
                          ->get()
                          ->map(function ($favorite) {
                              return [
                                  'id' => $favorite->id,
                                  'game_id' => $favorite->game_id,
                                  'created_at' => $favorite->created_at,
                                  'game' => $favorite->game,
                              ];
                          });

        return response()->json($favorites);
    }

    /**
     * Update user role (Admin only)
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Only admins can update roles
        if ($authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden - Admin access required'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:user,admin,moderator',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'Role updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'xp' => $user->xp,
                'level' => $user->level,
            ]
        ]);
    }

    /**
     * Update gamification data (Admin only)
     */
    public function updateGamification(Request $request, User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Only admins can manage gamification
        if ($authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden - Admin access required'], 403);
        }
        
        $validator = Validator::make($request->all(), [
            'xp' => 'sometimes|integer|min:0',
            'level' => 'sometimes|integer|min:1',
            'badges' => 'sometimes|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->fill($validator->validated());
        $user->save();

        return response()->json([
            'message' => 'Gamification updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'xp' => $user->xp,
                'level' => $user->level,
                'badges' => $user->badges,
            ]
        ]);
    }

    /**
     * Toggle ban status (Admin only)
     */
    public function toggleBan(User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Only admins can ban users
        if ($authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden - Admin access required'], 403);
        }
        
        $user->is_banned = !$user->is_banned;
        $user->save();

        return response()->json([
            'message' => $user->is_banned ? 'User banned successfully' : 'User unbanned successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'is_banned' => $user->is_banned,
            ],
        ]);
    }

    /**
     * Delete a user (Admin only)
     */
    public function destroy(User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Only admins can delete users
        if ($authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden - Admin access required'], 403);
        }
        
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
    
    /**
     * Get authenticated user's own data
     * All roles can view their own information
     */
    public function me(): JsonResponse
    {
        $user = Auth::user();
        
        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'role' => $user->role,
            'xp' => $user->xp,
            'level' => $user->level,
            'badges' => $user->badges,
            'is_banned' => $user->is_banned,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ]);
    }
}
