<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        // use authenticated user id; local fallback allowed for development only
        $userId = Auth::id();
        if (!$userId && app()->environment('local') && $request->filled('user_id')) {
            \Illuminate\Support\Facades\Log::warning('Using local dev fallback user_id in Api\\NotificationController', ['user_id' => $request->input('user_id')]);
            $userId = (int) $request->input('user_id');
        }
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);
        
        $query = Notification::where('user_id', $userId)->orderBy('read')->orderByDesc('created_at');
        $items = $query->limit(100)->get()->map(function($notif) {
            return [
                'id' => $notif->id,
                'type' => $notif->type,
                'title' => $this->getNotificationTitle($notif->type),
                'message' => $this->formatNotificationMessage($notif),
                'timestamp' => $notif->created_at,
                'read' => (bool) $notif->read,
            ];
        });
        
        return response()->json($items);
    }
    
    public function markAsRead(Request $request, $id)
    {
        $userId = Auth::id();
        if (!$userId && app()->environment('local') && $request->filled('user_id')) {
            $userId = (int) $request->input('user_id');
        }
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);
        
        $notification = Notification::where('id', $id)->where('user_id', $userId)->first();
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }
        
        $notification->update(['read' => true]);
        return response()->json(['success' => true]);
    }
    
    public function markAllAsRead(Request $request)
    {
        $userId = Auth::id();
        if (!$userId && app()->environment('local') && $request->filled('user_id')) {
            $userId = (int) $request->input('user_id');
        }
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);
        
        Notification::where('user_id', $userId)->where('read', false)->update(['read' => true]);
        return response()->json(['success' => true]);
    }
    
    public function destroy(Request $request, $id)
    {
        $userId = Auth::id();
        if (!$userId && app()->environment('local') && $request->filled('user_id')) {
            $userId = (int) $request->input('user_id');
        }
        if (!$userId) return response()->json(['message' => 'Unauthenticated'], 401);
        
        $notification = Notification::where('id', $id)->where('user_id', $userId)->first();
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }
        
        $notification->delete();
        return response()->json(['success' => true]);
    }
    
    private function getNotificationTitle($type)
    {
        $titles = [
            'achievement' => 'Achievement Unlocked!',
            'favorite' => 'New Favorite',
            'post_approved' => 'Post Approved',
            'post_declined' => 'Post Declined',
            'info' => 'Information',
            'warning' => 'Warning',
            'success' => 'Success',
        ];
        return $titles[$type] ?? 'Notification';
    }
    
    private function formatNotificationMessage($notification)
    {
        $payload = is_string($notification->payload) ? json_decode($notification->payload, true) : $notification->payload;
        $payload = $payload ?? [];
        
        switch ($notification->type) {
            case 'achievement':
                return $payload['message'] ?? 'You earned a new achievement!';
            case 'favorite':
                return $payload['message'] ?? 'A game has been added to your favorites.';
            case 'post_approved':
                return $payload['message'] ?? 'Your post has been approved and is now visible to the community.';
            case 'post_declined':
                return $payload['message'] ?? 'Your post has been declined. Please review community guidelines.';
            default:
                return $payload['message'] ?? 'You have a new notification.';
        }
    }
}



