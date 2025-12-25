<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        // Admin has access to everything
        if ($user->role === 'admin') {
            return $next($request);
        }
        
        // Moderator has access to moderator and user routes
        if ($role === 'moderator' && $user->role === 'moderator') {
            return $next($request);
        }
        
        // User role check
        if ($user->role === $role) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Forbidden.',
            'required_role' => $role,
            'user_role' => $user->role
        ], 403);
    }
}