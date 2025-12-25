<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            // Use web guard for authentication check
            $guardToCheck = $guard ?: 'web';
            if (Auth::guard($guardToCheck)->check()) {
                $user = Auth::guard($guardToCheck)->user();
                if ($user && $user->role) {
                    switch ($user->role) {
                        case 'admin':
                            return redirect('/admin-dashboard');
                        case 'moderator':
                            return redirect('/moderator-dashboard');
                        default:
                            return redirect('/user-dashboard');
                    }
                }
            }
        }

        return $next($request);
    }
}