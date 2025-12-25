<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view all users (admin only).
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can view the specific user.
     * Users can view themselves, admins can view anyone.
     */
    public function view(User $authenticatedUser, User $targetUser): bool
    {
        return $authenticatedUser->id === $targetUser->id || $authenticatedUser->role === 'admin';
    }

    /**
     * Determine if the user can update the specific user.
     * Users can update themselves, admins can update anyone.
     */
    public function update(User $authenticatedUser, User $targetUser): bool
    {
        return $authenticatedUser->id === $targetUser->id || $authenticatedUser->role === 'admin';
    }

    /**
     * Determine if the user can delete the specific user (admin only).
     */
    public function delete(User $user, User $targetUser): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can update roles (admin only).
     */
    public function updateRole(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can manage gamification (admin only).
     */
    public function manageGamification(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine if the user can ban users (admin only).
     */
    public function toggleBan(User $user): bool
    {
        return $user->role === 'admin';
    }
}

