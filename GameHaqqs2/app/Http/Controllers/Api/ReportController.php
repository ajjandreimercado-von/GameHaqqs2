<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    /**
     * Store a new report (user reports a post)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'reported_user_id' => 'required|exists:users,id',
            'post_id' => 'required|exists:posts,id',
            'reason' => 'required|string|max:500',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // Prevent self-reporting
        if ($userId == $data['reported_user_id']) {
            return response()->json(['message' => 'You cannot report yourself'], 400);
        }

        // Check if user already reported this post
        $existingReport = Report::where('reporter_id', $userId)
            ->where('post_id', $data['post_id'])
            ->first();

        if ($existingReport) {
            return response()->json(['message' => 'You have already reported this post'], 400);
        }

        $report = Report::create([
            'reporter_id' => $userId,
            'reported_user_id' => $data['reported_user_id'],
            'post_id' => $data['post_id'],
            'reason' => $data['reason'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'data' => $report
        ], 201);
    }

    /**
     * Get all reports (admin only)
     */
    public function index()
    {
        $reports = Report::with(['reporter:id,username', 'reportedUser:id,username', 'post:id,title'])
            ->latest()
            ->paginate(20);

        return response()->json($reports);
    }

    /**
     * Mute a user for 30 minutes (admin only)
     */
    public function muteUser(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        
        // Mute for 30 minutes from now
        $user->muted_until = now()->addMinutes(30);
        $user->save();

        // Update all reports for this user to 'reviewed'
        Report::where('reported_user_id', $userId)
            ->where('status', 'pending')
            ->update(['status' => 'reviewed']);

        return response()->json([
            'message' => 'User muted for 30 minutes',
            'muted_until' => $user->muted_until,
        ]);
    }

    /**
     * Dismiss a report (admin only)
     */
    public function dismiss($reportId)
    {
        $report = Report::findOrFail($reportId);
        $report->status = 'dismissed';
        $report->save();

        return response()->json([
            'message' => 'Report dismissed',
            'data' => $report
        ]);
    }
}
