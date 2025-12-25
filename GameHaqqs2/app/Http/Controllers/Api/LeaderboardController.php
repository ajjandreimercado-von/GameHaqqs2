<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Leaderboard;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class LeaderboardController extends Controller
{
    /**
     * Get leaderboard rankings (USERS ONLY - excludes admins/moderators)
     * GET /api/v1/leaderboard
     */
    public function index(): JsonResponse
    {
        $period = request()->query('period', 'all-time');
        
        // Get users ranked by XP (EXCLUDE admins and moderators)
        $rankings = User::where('role', 'user')
                       ->orderByDesc('xp')
                       ->limit(100)
                       ->get(['id', 'name as username', 'xp', 'level', 'created_at'])
                       ->map(function ($user, $index) {
                           return [
                               'rank' => $index + 1,
                               'id' => $user->id,
                               'username' => $user->username,
                               'xp' => $user->xp,
                               'level' => $user->level,
                               'joined' => $user->created_at->format('M Y'),
                           ];
                       });

        return response()->json([
            'period' => $period,
            'top' => $rankings->values(),
            'total_users' => $rankings->count(),
            'calculated_at' => now(),
        ]);
    }

    /**
     * Update leaderboard rankings (admin only)
     * POST /api/v1/leaderboard/update
     */
    public function update(): JsonResponse
    {
        $period = request()->query('period', 'weekly');
        Leaderboard::updateLeaderboard($period);
        
        return response()->json(['message' => 'Leaderboard updated successfully']);
    }

    /**
     * Get user's rank on leaderboard
     * GET /api/v1/leaderboard/user/{user}
     */
    public function userRank(User $user): JsonResponse
    {
        // Only rank regular users (not admins/moderators)
        if ($user->role !== 'user') {
            return response()->json([
                'message' => 'Only regular users are ranked on the leaderboard',
                'user_id' => $user->id,
                'username' => $user->name,
                'rank' => null,
            ]);
        }

        // Get user's rank among all users (exclude admins/moderators)
        $rank = User::where('role', 'user')
                   ->where('xp', '>', $user->xp)
                   ->count() + 1;

        $totalUsers = User::where('role', 'user')->count();

        return response()->json([
            'user_id' => $user->id,
            'username' => $user->name,
            'rank' => $rank,
            'xp' => $user->xp,
            'level' => $user->level,
            'total_users' => $totalUsers,
            'percentile' => $totalUsers > 0 ? round((($totalUsers - $rank + 1) / $totalUsers) * 100, 1) : 0,
        ]);
    }
}


