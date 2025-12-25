<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WebAuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'required|in:user,admin,moderator',
        ]);

        $credentials = $request->only('email', 'password');

        Log::info('Login attempt', [
            'ip' => $request->ip(),
            'email' => $request->input('email'),
            'role' => $request->input('role')
        ]);

        // Use web guard for authentication
        if (!Auth::attempt($credentials)) {
            Log::warning('Auth::attempt failed', [
                'email' => $request->input('email')
            ]);
            return back()
                ->withErrors(['email' => 'Invalid credentials'])
                ->withInput();
        }

        $user = Auth::user();
        
        if (!$user) {
            Log::error('User not found after Auth::attempt success', [
                'email' => $request->input('email')
            ]);
            return back()
                ->withErrors(['email' => 'Authentication error'])
                ->withInput();
        }

        if ($user->role !== $data['role']) {
            Log::warning('Role mismatch on login', [
                'email' => $user->email,
                'expected_role' => $data['role'],
                'actual_role' => $user->role
            ]);
            Auth::logout();
            return back()
                ->withErrors(['role' => "Invalid role. You are a {$user->role}, not a {$data['role']}"])
                ->withInput();
        }

        // Record login metadata
        try {
            \App\Models\User::where('id', $user->id)->update([
                'last_login_at' => now(),
                'last_login_ip' => $request->ip(),
                'login_count' => ($user->login_count ?? 0) + 1
            ]);
        } catch (\Exception $e) {
            report($e);
        }

        // Regenerate session to prevent fixation
        $request->session()->regenerate();
        Log::info('Login success', ['email' => $user->email, 'session_id' => $request->session()->getId()]);

        // Redirect using RedirectResponse to preserve cookies and session
        switch ($user->role) {
            case 'admin':
                return redirect('/admin-dashboard')->with('success', 'Logged in successfully.');
            case 'moderator':
                return redirect('/moderator-dashboard')->with('success', 'Logged in successfully.');
            default:
                return redirect('/user-dashboard')->with('success', 'Logged in successfully.');
        }
    }

    public function register(Request $request)
    {
        Log::info('Registration attempt', [
            'ip' => $request->ip(),
            'input' => $request->except(['password', 'password_confirmation'])
        ]);

        try {
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:150|unique:users',
                'password' => 'required|string|min:8|confirmed',
                'username' => 'required|string|max:80|unique:users',
                'role' => 'required|in:user,admin,moderator',
            ]);

            Log::info('Registration validation passed', [
                'email' => $data['email'],
                'username' => $data['username']
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Registration validation failed', [
                'errors' => $e->errors(),
            ]);
            return back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Registration validation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['general' => 'Registration failed: ' . $e->getMessage()])->withInput();
        }

        try {
            \Illuminate\Support\Facades\DB::beginTransaction();
            
            $user = \App\Models\User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
                'username' => $data['username'],
                'role' => $data['role'],
                'xp' => 0,
                'level' => 1,
                'badges' => json_encode([]),
            ]);

            // If registering as a moderator, create moderator record
            if ($data['role'] === 'moderator') {
                \App\Models\Moderator::create([
                    'user_id' => $user->id,
                    'assigned_category' => 'general' // default category
                ]);
            }
            \Illuminate\Support\Facades\DB::commit();
            
            Log::info('User created successfully', [
                'id' => $user->id,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            Log::error('Registration failed', [
                'email' => $data['email'] ?? 'unknown',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return back()->withErrors(['register' => 'Failed to create account: ' . $e->getMessage()])->withInput();
        }

        Log::info('User registered', ['email' => $user->email, 'id' => $user->id, 'ip' => $request->ip()]);

    // Auto-login after register
    Auth::login($user);

    // Regenerate session
    $request->session()->regenerate();

    // Redirect based on role
    switch ($user->role) {
        case 'admin':
            return redirect('/admin-dashboard')->with('success', 'Account created and logged in successfully.');
        case 'moderator':
            return redirect('/moderator-dashboard')->with('success', 'Account created and logged in successfully.');
        default:
            return redirect('/user-dashboard')->with('success', 'Account created and logged in successfully.');
    }
    }

    public function logout(Request $request)
    {
        // Revoke all tokens for the authenticated user
        if (Auth::check()) {
            $user = Auth::user();
            if ($user && method_exists($user, 'tokens') && is_callable([$user, 'tokens'])) {
                $user->tokens()->delete();
            }
        }
        
        // Logout from web guard
        Auth::logout();
        
        // Invalidate the session
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/login')->with('success', 'Logged out successfully.');
    }
}
