<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    UserController,
    GameController,
    ReviewController,
    TipController,
    WikiController,
    CommentController,
    TagController,
    LeaderboardController,
    NotificationController,
    PostController,
    AdminController,
    ReportController,
    AchievementController
};
use App\Http\Controllers\ModeratorController;
use App\Http\Controllers\GameApiController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/v1/public/games', [GameController::class, 'publicIndex']);

Route::middleware(['auth:sanctum'])->group(function () {

    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/me', [UserController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::prefix('v1')->group(function () {

        // ADMIN ROUTES
        Route::middleware('role:admin')->group(function () {
            Route::get('/users', [UserController::class, 'index']);
            Route::patch('/users/{user}/role', [UserController::class, 'updateRole']);
            Route::patch('/users/{user}/gamification', [UserController::class, 'updateGamification']);
            Route::patch('/users/{user}/ban', [UserController::class, 'toggleBan']);
            Route::delete('/users/{user}', [UserController::class, 'destroy']);
        });

        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::get('/users/{user}/activity', [UserController::class, 'activity']);
        Route::get('/users/{user}/favorites', [UserController::class, 'favorites']);

        // GAMES
        Route::get('/games', [GameController::class, 'index']);
        Route::get('/games/{game}', [GameController::class, 'show']);

        Route::middleware('role:admin')->group(function () {
            Route::post('/games', [GameController::class, 'store']);
            Route::patch('/games/{game}', [GameController::class, 'update']);
            Route::delete('/games/{game}', [GameController::class, 'destroy']);
        });

        Route::post('/games/{game}/favorite', [GameController::class, 'favorite']);

        // REVIEWS
        Route::get('/reviews', [ReviewController::class, 'index']);
        Route::get('/reviews/{review}', [ReviewController::class, 'show']);
        Route::get('/games/{game}/reviews/stats', [ReviewController::class, 'getGameRatingStats']);
        Route::post('/games/{game}/reviews', [ReviewController::class, 'store']);
        Route::patch('/reviews/{review}', [ReviewController::class, 'update']);
        Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
        Route::post('/reviews/{review}/like', [ReviewController::class, 'like']);
        Route::post('/reviews/{review}/comment', [ReviewController::class, 'comment']);

        // TIPS
        Route::get('/tips', [TipController::class, 'index']);
        Route::get('/tips/{tip}', [TipController::class, 'show']);
        Route::post('/games/{game}/tips', [TipController::class, 'store']);
        Route::patch('/tips/{tip}', [TipController::class, 'update']);
        Route::delete('/tips/{tip}', [TipController::class, 'destroy']);
        Route::post('/tips/{tip}/like', [TipController::class, 'like']);
        Route::post('/tips/{tip}/comment', [TipController::class, 'comment']);

        // WIKIS
        Route::get('/wikis', [WikiController::class, 'index']);
        Route::get('/wikis/{wiki}', [WikiController::class, 'show']);
        Route::post('/games/{game}/wikis', [WikiController::class, 'store']);
        Route::patch('/wikis/{wiki}', [WikiController::class, 'update']);
        Route::delete('/wikis/{wiki}', [WikiController::class, 'destroy']);
        Route::post('/wikis/{wiki}/like', [WikiController::class, 'like']);
        Route::post('/wikis/{wiki}/comment', [WikiController::class, 'comment']);

        // ------------------------
        // COMMENTS
        // ------------------------
        Route::get('/comments', [CommentController::class, 'index']);
        Route::get('/comments/{comment}', [CommentController::class, 'show']);
        Route::patch('/comments/{comment}', [CommentController::class, 'update']);
        Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
        Route::post('/comments/{comment}/like', [CommentController::class, 'like']);

        // ------------------------
        // TAGS (ADMIN ONLY)
        // ------------------------
        Route::get('/tags', [TagController::class, 'index']);
        Route::get('/tags/{tag}', [TagController::class, 'show']);
        Route::get('/tags/{tag}/games', [TagController::class, 'games']);

        Route::middleware('role:admin')->group(function () {
            Route::post('/tags', [TagController::class, 'store']);
            Route::patch('/tags/{tag}', [TagController::class, 'update']);
            Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
            Route::post('/tags/{tag}/games/{game}/attach', [TagController::class, 'attachToGame']);
            Route::delete('/tags/{tag}/games/{game}/detach', [TagController::class, 'detachFromGame']);
        });

        // LEADERBOARD
        Route::get('/leaderboard', [LeaderboardController::class, 'index']);
        Route::get('/leaderboard/user/{user}', [LeaderboardController::class, 'userRank']);
        Route::post('/leaderboard/update', [LeaderboardController::class, 'update'])->middleware('role:admin');

        // ACHIEVEMENTS
        Route::get('/achievements', [AchievementController::class, 'all']);
        Route::get('/users/{user}/achievements', [AchievementController::class, 'index']);
        Route::post('/users/{user}/achievements/check', [AchievementController::class, 'check']);
        Route::post('/users/{user}/achievements/{achievement}/unlock', [AchievementController::class, 'unlock']);

        // NOTIFICATIONS
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

        // POSTS
        Route::get('/posts', [PostController::class, 'index']);
        Route::get('/posts/{post}', [PostController::class, 'show']);
        Route::post('/posts', [PostController::class, 'store']);
        Route::delete('/posts/{post}', [PostController::class, 'destroy']);
        Route::patch('/posts/{post}/status', [PostController::class, 'updateStatus'])
            ->middleware('role:moderator');
        Route::post('/posts/{post}/like', [PostController::class, 'toggleLike']);
        Route::post('/posts/{post}/comment', [PostController::class, 'addComment']);

        // REPORTS
        Route::post('/reports', [ReportController::class, 'store']);
        Route::middleware('role:admin')->group(function () {
            Route::get('/reports', [ReportController::class, 'index']);
            Route::post('/reports/{userId}/mute', [ReportController::class, 'muteUser']);
            Route::patch('/reports/{reportId}/dismiss', [ReportController::class, 'dismiss']);
        });

        // ROLE-BASED LISTS
        Route::middleware('role:admin')->group(function () {
            Route::get('/moderators', [ModeratorController::class, 'index']);
            Route::get('/admins', [AdminController::class, 'index']);
        });

        Route::get('/admin/data', [AdminController::class, 'getAdminData'])->middleware('role:admin');

        // DASHBOARDS
        Route::middleware('role:user')->prefix('user')->group(function () {
            Route::get('/dashboard', fn() => response()->json(['message' => 'User Dashboard']));
            Route::patch('/profile', [AuthController::class, 'updateProfile']);
        });

        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', fn() => response()->json(['message' => 'Admin Dashboard']));
            Route::get('/data', [AdminController::class, 'getAdminData']);
        });

        Route::middleware('role:moderator')->prefix('moderator')->group(function () {
            Route::get('/dashboard', fn() => response()->json(['message' => 'Moderator Dashboard']));
            Route::get('/pending-posts', [ModeratorController::class, 'pendingPosts']);
            Route::get('/all-posts', [ModeratorController::class, 'allPosts']);
            Route::post('/posts/{id}/approve', [ModeratorController::class, 'approve']);
            Route::post('/posts/{id}/decline', [ModeratorController::class, 'decline']);
        });
    });
});

// ========================================
// RAWG API INTEGRATION ROUTES (Public)
// ========================================
Route::prefix('rawg')->group(function () {
    // Browse games from RAWG
    Route::get('/games', [GameApiController::class, 'index']);
    Route::get('/games/{id}', [GameApiController::class, 'show']);
    Route::get('/games/{id}/screenshots', [GameApiController::class, 'screenshots']);
    
    // Search and filters
    Route::get('/search', [GameApiController::class, 'search']);
    Route::get('/popular', [GameApiController::class, 'popular']);
    Route::get('/recent', [GameApiController::class, 'recent']);
    Route::get('/upcoming', [GameApiController::class, 'upcoming']);
    Route::get('/genre/{genre}', [GameApiController::class, 'byGenre']);
    
    // Import games to local database (protected)
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/import', [GameApiController::class, 'import']);
        Route::post('/sync-popular', [GameApiController::class, 'syncPopular']);
    });
});
