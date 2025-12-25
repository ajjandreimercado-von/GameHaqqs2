<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Admin::with('user')->get()]);
    }

    public function getAdminData(Request $request)
    {
        $totalUsers = \App\Models\User::count();
        $totalGames = \App\Models\Game::count();
        $pendingReports = \App\Models\Post::where('status', 'pending')->count();
        $activeUsers = \App\Models\User::where('last_login_at', '>=', now()->subDays(7))->count();
        
        return response()->json([
            'message' => 'Admin data accessed successfully',
            'data' => [
                'admin_info' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'xp' => $request->user()->xp,
                    'level' => $request->user()->level
                ],
                'admin_stats' => [
                    'total_users' => $totalUsers,
                    'total_games' => $totalGames,
                    'pending_reports' => $pendingReports,
                    'active_users' => $activeUsers,
                    'total_reviews' => \App\Models\Review::count(),
                    'total_posts' => \App\Models\Post::count()
                ],
                'recent_activity' => [
                    'new_users_today' => \App\Models\User::whereDate('created_at', today())->count(),
                    'new_games_this_week' => \App\Models\Game::where('created_at', '>=', now()->subWeek())->count()
                ]
            ]
        ]);
    }
}


