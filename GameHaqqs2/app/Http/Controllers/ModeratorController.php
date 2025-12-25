<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\ModeratorAction;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ModeratorController extends Controller
{
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

        DB::transaction(function() use ($post, $user, $request) {
            $post->update(['status' => 'approved', 'published_at' => now()]);
            ModeratorAction::create([
                'moderator_id' => $user->id,
                'post_id' => $post->id,
                'action' => 'approve',
                'reason' => $request->input('reason'),
            ]);
            
            // Notify the post author
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'post_approved',
                'payload' => [
                    'title' => 'Post Approved',
                    'message' => 'Your post "' . $post->title . '" has been approved and is now visible to everyone.',
                    'post_id' => $post->id,
                ],
                'read' => false,
            ]);
        });

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

        DB::transaction(function() use ($post, $user, $request) {
            $post->update(['status' => 'declined']);
            ModeratorAction::create([
                'moderator_id' => $user->id,
                'post_id' => $post->id,
                'action' => 'decline',
                'reason' => $request->input('reason'),
            ]);
            
            // Notify the post author
            $reason = $request->input('reason') ? ' Reason: ' . $request->input('reason') : '';
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'post_declined',
                'payload' => [
                    'title' => 'Post Declined',
                    'message' => 'Your post "' . $post->title . '" has been declined by a moderator.' . $reason,
                    'post_id' => $post->id,
                ],
                'read' => false,
            ]);
        });

        return response()->json(['success' => true]);
    }

    /**
     * Get all posts for moderator dashboard (pending, approved, declined)
     */
    public function allPosts()
    {
        $user = Auth::user();
        // DEV-fallback (local only)
        if (!$user && app()->environment('local') && request()->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in ModeratorController', ['user_id' => request()->input('user_id')]);
            $uid = request()->input('user_id');
            $user = $uid ? \App\Models\User::find($uid) : null;
        }
        if (!$user || $user->role !== 'moderator') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        // Get posts with pending, approved, or declined status
        $posts = Post::whereIn('status', ['pending', 'approved', 'declined'])
            ->with('author:id,username,name')
            ->latest()
            ->get();
        
        // Format response to ensure consistent structure
        $formattedPosts = $posts->map(function($post) {
            // Get moderator action for approved/declined posts
            $moderatorAction = ModeratorAction::where('post_id', $post->id)
                ->with('moderator:id,username,name')
                ->latest()
                ->first();
            
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'user_id' => $post->user_id,
                'author' => $post->author ? $post->author->username : 'Unknown',
                'author_id' => $post->user_id,
                'image_url' => $post->image_url,
                'video_url' => $post->video_url,
                'status' => $post->status, // Status already matches frontend expectations
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
                'reviewed_at' => $moderatorAction ? $moderatorAction->created_at : null,
                'reviewed_by' => $moderatorAction && $moderatorAction->moderator ? $moderatorAction->moderator->username : null,
            ];
        });
        
        return response()->json($formattedPosts);
    }
}
