<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Like;
use App\Models\Comment;
use App\Models\Moderator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->query('status');
        $query = Post::query()->with(['author:id,username', 'likes', 'comments.author:id,username']);
        
        if ($status) {
            $query->where('status', $status);
        } else {
            $query->where('status', 'approved');
        }
        
        $posts = $query->latest()->paginate(10);
        
        $currentUserId = Auth::id();
        
        $plainData = [];
        foreach ($posts->items() as $post) {
            $userLiked = false;
            if ($currentUserId) {
                $userLiked = $post->likes()
                    ->where('user_id', $currentUserId)
                    ->exists();
            }
            
            // Format comments
            $commentsData = [];
            foreach ($post->comments as $comment) {
                $commentsData[] = [
                    'id' => (int) $comment->id,
                    'author' => $comment->author ? $comment->author->username : 'Unknown',
                    'content' => (string) $comment->content,
                    'created_at' => $comment->created_at->diffForHumans(),
                ];
            }
            
            $plainData[] = [
                'id' => (int) $post->id,
                'user_id' => (int) $post->user_id,
                'author' => $post->author ? $post->author->username : 'Unknown',
                'title' => (string) $post->title,
                'content' => (string) $post->content,
                'image_url' => $post->image_url ? (string) $post->image_url : null,
                'video_url' => $post->video_url ? (string) $post->video_url : null,
                'status' => (string) $post->status,
                'moderator_id' => $post->moderator_id ? (int) $post->moderator_id : null,
                'likes' => $post->likes->count(),
                'liked' => $userLiked,
                'comments' => $commentsData,
                'created_at' => $post->created_at,
                'updated_at' => $post->updated_at,
            ];
        }
        
        return response()->json([
            'data' => $plainData,
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        if ($request->hasFile('video')) {
            $video = $request->file('video');
            if ($video->getError() !== UPLOAD_ERR_OK) {
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'The video exceeds the upload_max_filesize directive in php.ini (currently ' . ini_get('upload_max_filesize') . ')',
                    UPLOAD_ERR_FORM_SIZE => 'The video exceeds the MAX_FILE_SIZE directive',
                    UPLOAD_ERR_PARTIAL => 'The video was only partially uploaded',
                    UPLOAD_ERR_NO_FILE => 'No video was uploaded',
                    UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                    UPLOAD_ERR_CANT_WRITE => 'Failed to write video to disk',
                    UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the video upload',
                ];
                $message = $errorMessages[$video->getError()] ?? 'Unknown upload error';
                return response()->json(['message' => $message], 422);
            }
        }
        
        $data = $request->validate([
            'title' => 'required|string|max:150',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'video' => 'nullable|mimes:mp4,mov,avi,wmv|max:20480',
        ]);
            $userId = Auth::id();
            if (!$userId && app()->environment('local') && isset($data['user_id'])) {
                \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in Api\\PostController', ['user_id' => $data['user_id']]);
                $userId = (int) $data['user_id'];
            }
            if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);
            
            $user = Auth::user();
            if ($user && $user->isMuted()) {
                return response()->json([
                    'message' => 'You are temporarily muted from posting. Please try again later.',
                    'muted_until' => $user->muted_until,
                ], 403);
            }
            
            $postData = [
                'user_id' => $userId,
                'title' => $data['title'],
                'content' => $data['content'],
                'status' => 'pending',
            ];
            
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('images/posts'), $imageName);
                $postData['image_url'] = 'images/posts/' . $imageName;
            }
            
            if ($request->hasFile('video')) {
                $video = $request->file('video');
                $videoName = time() . '_' . uniqid() . '.' . $video->getClientOriginalExtension();
                $video->move(public_path('videos/posts'), $videoName);
                $postData['video_url'] = 'videos/posts/' . $videoName;
            }
            
            $post = Post::create($postData);
            
            if ($user) {
                $user->addXP(10); // 10 XP per post
            }
            
        return response()->json(['data' => $post], 201);
    }

    public function show(Post $post)
    {
        $plainData = [
            'id' => (int) $post->id,
            'user_id' => (int) $post->user_id,
            'title' => (string) $post->title,
            'content' => (string) $post->content,
            'status' => (string) $post->status,
            'moderator_id' => $post->moderator_id ? (int) $post->moderator_id : null,
            'created_at' => $post->created_at,
            'updated_at' => $post->updated_at,
        ];
        
        return response()->json(['data' => $plainData]);
    }

    public function updateStatus(Request $request, Post $post)
    {
        $data = $request->validate([
            'status' => 'required|string|in:approved,rejected',
        ]);
        
        $post->update([
            'status' => $data['status'],
        ]);
        
        return response()->json(['data' => $post]);
    }

    public function destroy(Request $request, Post $post)
    {
        // Author or admin check
        $user = Auth::user();
        if ($user->id !== $post->user_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        
        $post->delete();
        return response()->json(['deleted' => true]);
    }

    /**
     * Toggle like on a post
     */
    public function toggleLike(Request $request, Post $post)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $like = Like::where('user_id', $user->id)
            ->where('likeable_type', Post::class)
            ->where('likeable_id', $post->id)
            ->first();

        if ($like) {
            // Unlike
            $like->delete();
            $liked = false;
        } else {
            // Like
            Like::create([
                'user_id' => $user->id,
                'likeable_type' => Post::class,
                'likeable_id' => $post->id,
            ]);
            $liked = true;
        }

        $likesCount = $post->likes()->count();

        return response()->json([
            'liked' => $liked,
            'likes_count' => $likesCount,
        ]);
    }

    /**
     * Add a comment to a post
     */
    public function addComment(Request $request, Post $post)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->isMuted()) {
            return response()->json([
                'message' => 'You are temporarily muted from commenting. Please try again later.',
                'muted_until' => $user->muted_until,
            ], 403);
        }

        $data = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment = Comment::create([
            'author_id' => $user->id,
            'content' => $data['content'],
            'commentable_type' => Post::class,
            'commentable_id' => $post->id,
        ]);

        $user->addXP(5);

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => [
                'id' => $comment->id,
                'author' => $user->username,
                'content' => $comment->content,
                'created_at' => $comment->created_at,
            ],
        ], 201);
    }
}


