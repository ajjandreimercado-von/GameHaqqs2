<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated via Sanctum (handles both tokens and sessions)
        if (Auth::guard('sanctum')->check()) {
            return $next($request);
        }
        
        // If Sanctum fails, try web guard (for session-based auth from web interface)
        if (Auth::guard('web')->check()) {
            // Set the authenticated user for the Sanctum guard as well
            Auth::guard('sanctum')->setUser(Auth::guard('web')->user());
            return $next($request);
        }
        
        // If both fail, return unauthenticated
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }
}
