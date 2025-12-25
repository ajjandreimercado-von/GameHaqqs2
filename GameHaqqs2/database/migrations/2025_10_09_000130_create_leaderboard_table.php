<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('leaderboard')) {
            Schema::create('leaderboard', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->integer('rank');
                $table->integer('xp');
                $table->integer('level');
                $table->string('period', 20)->default('weekly'); // weekly, monthly, all-time
                $table->timestamp('calculated_at');
                $table->timestamps();
                
                $table->index(['period', 'rank']);
                $table->index(['user_id', 'period']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('leaderboard');
    }
};
