<?php

namespace App\Services;

use App\Models\User;
use App\Models\Review;
use App\Models\TipAndTrick;
use App\Models\Like;

class GamificationService
{
    public function awardXp(int $userId, int $xp): void
    {
        $user = User::where('id', $userId)->lockForUpdate()->firstOrFail();
        $user->xp = ($user->xp ?? 0) + $xp;
        $user->level = intdiv($user->xp, 500) + 1;
        $user->save();
        $this->recalculateBadges($user);
    }

    public function recalculateBadges(User $user): void
    {
        $reviewCount = Review::where('author_id', $user->id)->count();
        $tipCount = TipAndTrick::where('author_id', $user->id)->count();
        $likesReceived = Like::whereIn('review_id', function ($q) use ($user) {
                $q->select('id')->from('reviews')->where('author_id', $user->id);
            })->count()
            + Like::whereIn('tip_id', function ($q) use ($user) {
                $q->select('id')->from('tip_and_tricks')->where('author_id', $user->id);
            })->count();

        $badges = collect($user->badges ?? []);
        if ($reviewCount >= 10) { $badges->push('Contributor'); }
        if ($tipCount >= 5) { $badges->push('Strategist'); }
        if ($likesReceived >= 100) { $badges->push('Influencer'); }
        $user->badges = $badges->unique()->values()->all();
        $user->save();
    }
}


