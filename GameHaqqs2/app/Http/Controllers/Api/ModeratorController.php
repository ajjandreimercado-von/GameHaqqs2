<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Moderator;
use App\Models\Post;
use App\Models\ModeratorAction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ModeratorController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Moderator::with('user')->get()]);
    }

    public function pendingPosts()
    {
        $user = Auth::user();
        // DEV-fallback (local only): allow providing user_id for testing, but log it.
        if (!$user && app()->environment('local') && request()->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in ModeratorController', ['user_id' => request()->input('user_id')]);
            $uid = request()->input('user_id');
            $user = $uid ? \App\Models\User::find($uid) : null;
        }
        if (!$user || $user->role !== 'moderator') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $posts = Post::where('status', 'pending')->with('author:id,username,name')->latest()->get();
        
        // Format response to ensure consistent structure
        $formattedPosts = $posts->map(function($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'user_id' => $post->user_id,
                'author' => $post->author ? $post->author->username : 'Unknown',
                'author_id' => $post->user_id,
                'image_url' => $post->image_url,
                'video_url' => $post->video_url,
                'status' => $post->status,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
            ];
        });
        
        return response()->json($formattedPosts);
    }

    public function approve(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user && app()->environment('local') && $request->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in ModeratorController', ['user_id' => $request->input('user_id')]);
            $uid = $request->input('user_id');
            $user = $uid ? \App\Models\User::find($uid) : null;
        }
        if (!$user || $user->role !== 'moderator') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $post = Post::findOrFail($id);
        if ($post->status !== 'pending') {
            return response()->json(['message' => 'Post not pending'], 422);
        }

        $post->update(['status' => 'approved']);
        
        // TODO: Add ModeratorAction logging when table is created
        // ModeratorAction::create([
        //     'moderator_id' => $user->id,
        //     'post_id' => $post->id,
        //     'action' => 'approve',
        //     'reason' => $request->input('reason'),
        // ]);

        return response()->json(['success' => true, 'post' => $post]);
    }

    public function decline(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user && app()->environment('local') && $request->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in ModeratorController', ['user_id' => $request->input('user_id')]);
            $uid = $request->input('user_id');
            $user = $uid ? \App\Models\User::find($uid) : null;
        }
        if (!$user || $user->role !== 'moderator') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        $post = Post::findOrFail($id);
        if ($post->status !== 'pending') {
            return response()->json(['message' => 'Post not pending'], 422);
        }

        $post->update(['status' => 'declined']);
        
        // TODO: Add ModeratorAction logging when table is created
        // ModeratorAction::create([
        //     'moderator_id' => $user->id,
        //     'post_id' => $post->id,
        //     'action' => 'decline',
        //     'reason' => $request->input('reason'),
        // ]);

        return response()->json(['success' => true]);
    }
}


