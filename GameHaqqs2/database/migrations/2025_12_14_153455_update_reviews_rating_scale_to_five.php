<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Convert existing reviews from 0-10 scale to 0-5 scale
     */
    public function up(): void
    {
        // Update all existing reviews by dividing their rating by 2
        DB::table('reviews')->update([
            'rating' => DB::raw('rating / 2')
        ]);
    }

    /**
     * Reverse the migrations.
     * Convert back from 0-5 scale to 0-10 scale
     */
    public function down(): void
    {
        // Update all existing reviews by multiplying their rating by 2
        DB::table('reviews')->update([
            'rating' => DB::raw('rating * 2')
        ]);
    }
};
