<?php

namespace App\Http\Controllers;

use App\Models\Game;
use App\Models\Like;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameInteractionController extends Controller
{
    public function like(Request $request, Game $game)
    {
        $data = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'action' => 'nullable|string|in:add,remove',
        ]);

        $user = Auth::user();
        if (!$user && app()->environment('local') && $request->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in GameInteractionController', ['user_id' => $request->input('user_id')]);
            $user = \App\Models\User::find($request->input('user_id'));
        }
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $action = $data['action'] ?? 'add';
        if ($action === 'remove') {
            Like::where('likeable_type', Game::class)
                ->where('likeable_id', $game->id)
                ->where('user_id', $user->id)
                ->delete();

            return response()->json(['liked' => false]);
        }

        $like = Like::firstOrCreate([
            'likeable_type' => Game::class,
            'likeable_id' => $game->id,
            'user_id' => $user->id,
        ]);

        return response()->json(['liked' => true, 'like_id' => $like->id]);
    }

    public function comment(Request $request, Game $game)
    {
        $data = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|integer',
        ]);

        $user = Auth::user();
        if (!$user && $request->filled('user_id')) {
            $user = \App\Models\User::find($request->input('user_id'));
        }
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $comment = $game->comments()->create([
            'content' => $data['content'],
            'author_id' => $user->id,
            'parent_id' => $data['parent_id'] ?? null,
        ]);

        return response()->json($comment, 201);
    }
}
