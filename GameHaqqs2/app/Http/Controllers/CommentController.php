<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|integer',
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|integer',
        ]);

        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $map = [
            'review' => \App\Models\Review::class,
            'tip' => \App\Models\TipAndTrick::class,
            'wiki' => \App\Models\Wiki::class,
            'post' => \App\Models\Post::class,
            'game' => \App\Models\Game::class,
        ];

        if (!isset($map[$data['commentable_type']])) {
            return response()->json(['message' => 'Invalid commentable_type'], 422);
        }

        $modelClass = $map[$data['commentable_type']];
        $target = $modelClass::find($data['commentable_id']);
        if (!$target) {
            return response()->json(['message' => 'Target not found'], 404);
        }

        $comment = null;
        DB::transaction(function () use ($data, $user, $target, &$comment) {
            $comment = $target->comments()->create([
                'content' => $data['content'],
                'author_id' => $user->id,
                'parent_id' => $data['parent_id'] ?? null,
            ]);
        });

        return response()->json($comment, 201);
    }
}
