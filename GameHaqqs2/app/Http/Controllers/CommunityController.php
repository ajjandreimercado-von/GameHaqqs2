<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class CommunityController extends Controller
{
    public function index()
    {
        $posts = CommunityPost::where('status', 'Approved')->with('author')->latest()->paginate(20);
        return response()->json($posts);
    }

    public function store(Request $request)
    {
        // Prefer authenticated user
        $user = Auth::user();

        // DEV-Fallback (local environment only): allow passing user_id, but log a warning.
        if (!$user && app()->environment('local') && $request->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in CommunityController', ['user_id' => $request->input('user_id')]);
            $user = User::find($request->input('user_id'));
        }
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|min:10',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
            'video' => 'nullable|mimes:mp4,mov,avi,wmv,webm|max:51200', // 50MB max
        ]);

        // Initialize post data
        $postData = [
            'title' => $data['title'],
            'content' => $data['content'],
            'user_id' => $user->id,
            'status' => 'pending',
        ];

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts/images', 'public');
            $postData['image_url'] = '/' . $imagePath;
        }

        // Handle video upload
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('posts/videos', 'public');
            $postData['video_url'] = '/' . $videoPath;
        }

        $post = Post::create($postData);

        return response()->json($post, 201);
    }

    public function show($id)
    {
        $post = CommunityPost::with('author', 'comments')->findOrFail($id);
        if ($post->status !== 'Approved') {
            abort(404);
        }
        return response()->json($post);
    }
}
