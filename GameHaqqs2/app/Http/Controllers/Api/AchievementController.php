<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Achievement;
use App\Services\AchievementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AchievementController extends Controller
{
    protected $achievementService;

    public function __construct(AchievementService $achievementService)
    {
        $this->achievementService = $achievementService;
    }

    /**
     * Get user's achievements with unlock status and progress
     * GET /api/v1/users/{user}/achievements
     */
    public function index(User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Users can view their own achievements, admins can view anyone's
        if ($authenticatedUser->id !== $user->id && $authenticatedUser->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $achievements = $this->achievementService->getUserAchievements($user);
        
        return response()->json([
            'achievements' => $achievements,
            'total' => count($achievements),
            'unlocked' => count(array_filter($achievements, fn($a) => $a['unlocked'])),
        ]);
    }

    /**
     * Get all available achievements (master list)
     * GET /api/v1/achievements
     */
    public function all(): JsonResponse
    {
        $achievements = Achievement::orderBy('rarity')
                                   ->orderBy('name')
                                   ->get();
        
        return response()->json($achievements);
    }

    /**
     * Manually unlock an achievement for testing (admin only)
     * POST /api/v1/users/{user}/achievements/{achievement}/unlock
     */
    public function unlock(User $user, Achievement $achievement): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Only admins or the user themselves can unlock
        if ($authenticatedUser->role !== 'admin' && $authenticatedUser->id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Check if already unlocked
        $existing = $user->achievements()->where('achievement_id', $achievement->id)->exists();
        if ($existing) {
            return response()->json(['message' => 'Achievement already unlocked'], 400);
        }

        $userAchievement = $this->achievementService->unlockAchievement($user, $achievement);

        return response()->json([
            'message' => 'Achievement unlocked!',
            'achievement' => $achievement,
            'xp_awarded' => $achievement->xp_reward,
            'unlocked_at' => $userAchievement->unlocked_at,
        ]);
    }

    /**
     * Check and auto-unlock achievements based on user progress
     * POST /api/v1/users/{user}/achievements/check
     */
    public function check(User $user): JsonResponse
    {
        $authenticatedUser = Auth::user();
        
        // Only the user themselves can trigger check
        if ($authenticatedUser->id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $newlyUnlocked = $this->achievementService->checkAndUnlockAchievements($user);

        return response()->json([
            'message' => count($newlyUnlocked) > 0 ? 'New achievements unlocked!' : 'No new achievements',
            'newly_unlocked' => $newlyUnlocked->map(fn($a) => [
                'name' => $a->name,
                'description' => $a->description,
                'icon' => $a->icon,
                'xp_reward' => $a->xp_reward,
            ]),
            'count' => count($newlyUnlocked),
        ]);
    }
}
