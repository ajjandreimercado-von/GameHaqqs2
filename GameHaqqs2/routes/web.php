<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\SiteController;

// Public routes
Route::get('/', function () {
    return redirect('/login');
});

Route::get('/login', function () {
    // Check if user is authenticated using web guard
    if (Auth::guard('web')->check()) {
        $user = Auth::guard('web')->user();
        $role = $user->role ?? 'user';
        switch ($role) {
            case 'admin':
                return redirect('/admin-dashboard');
            case 'moderator':
                return redirect('/moderator-dashboard');
            default:
                return redirect('/user-dashboard');
        }
    }
    return view('auth.login');
})->name('login');
// Handle web login POST
use App\Http\Controllers\WebAuthController;
Route::post('/login', [WebAuthController::class, 'login']);

Route::get('/register', function () {
    return view('auth.register');
});
// Handle web register POST
Route::post('/register', [WebAuthController::class, 'register']);

// Role-based dashboard routes - Using web guard instead of api

// Protected dashboard routes
Route::middleware(['auth'])->group(function () {
    Route::get('/user-dashboard', function () {
        $user = Auth::user();
        if (!$user || $user->role !== 'user') {
            return redirect('/login')->withErrors(['role' => 'Invalid role for this user']);
        }
        return view('dashboards.user');
    })->name('user.dashboard');

    Route::get('/admin-dashboard', function () {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return redirect('/login')->withErrors(['role' => 'Invalid role for this user']);
        }
        return view('dashboards.admin');
    })->name('admin.dashboard');

    Route::get('/moderator-dashboard', function () {
        $user = Auth::user();
        if (!$user || $user->role !== 'moderator') {
            return redirect('/login')->withErrors(['role' => 'Invalid role for this user']);
        }
        return view('dashboards.moderator');
    })->name('moderator.dashboard');
});

// Logout route
Route::post('/logout', [WebAuthController::class, 'logout']);

// Legacy routes
Route::get('/api-links', function(){
    $base = request('base', '/api/v1');
    return view('api.index', compact('base'));
});

// Community & comments
use App\Http\Controllers\CommentController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\ModeratorController;

Route::post('/comments', [CommentController::class, 'store']);
Route::get('/community', [CommunityController::class, 'index']);
Route::post('/community/posts', [CommunityController::class, 'store']);
Route::get('/community/posts/{id}', [CommunityController::class, 'show']);

// Moderator actions
Route::get('/moderator/pending-posts', [ModeratorController::class, 'pendingPosts']);
Route::post('/moderator/posts/{id}/approve', [ModeratorController::class, 'approve']);
Route::post('/moderator/posts/{id}/decline', [ModeratorController::class, 'decline']);

// Simple UI pages (server-rendered views)
Route::get('/community-page', function(){ return view('community.index'); });
Route::get('/moderator-panel', function(){ return view('community.moderator'); });

// Public games page (server-rendered)
use App\Models\Game;
Route::get('/games', function() {
    // Eager-load relationships used in the view to avoid N+1 and ensure
    // polymorphic columns are referenced after migrations are applied.
    $games = Game::with(['reviews', 'wikis', 'tipsAndTricks', 'comments', 'likes', 'tags'])->paginate(10);
    return view('games.index', compact('games'));
});

// Interaction endpoints for games (likes & comments)
use App\Http\Controllers\GameInteractionController;
Route::post('/games/{game}/like', [GameInteractionController::class, 'like']);
Route::post('/games/{game}/comments', [GameInteractionController::class, 'comment']);


