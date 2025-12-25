<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Master achievements table (defines all available achievements)
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g., 'first_victory', 'speed_demon'
            $table->string('name'); // e.g., 'First Victory'
            $table->text('description'); // e.g., 'Win your first game'
            $table->string('icon')->default('🏆'); // emoji or icon identifier
            $table->enum('rarity', ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'])->default('Common');
            $table->integer('xp_reward')->default(50); // XP awarded when unlocked
            $table->json('criteria')->nullable(); // JSON criteria for auto-unlock
            $table->timestamps();
        });

        // User achievements (tracks which users have unlocked which achievements)
        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('achievement_id')->constrained()->onDelete('cascade');
            $table->timestamp('unlocked_at');
            $table->integer('progress')->default(100); // % progress (100 = unlocked)
            $table->timestamps();
            
            // Prevent duplicate unlocks
            $table->unique(['user_id', 'achievement_id']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
