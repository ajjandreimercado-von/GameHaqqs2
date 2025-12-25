<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('favorites')) {
            Schema::create('favorites', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['user_id', 'game_id']);
            });
        }

        if (!Schema::hasTable('likes')) {
            Schema::create('likes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('review_id')->nullable()->constrained('reviews')->cascadeOnDelete();
                $table->foreignId('tip_id')->nullable()->constrained('tip_and_tricks')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['user_id','review_id']);
                $table->unique(['user_id','tip_id']);
            });
        }

        if (!Schema::hasTable('comments')) {
            Schema::create('comments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('author_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('review_id')->nullable()->constrained('reviews')->cascadeOnDelete();
                $table->foreignId('tip_id')->nullable()->constrained('tip_and_tricks')->cascadeOnDelete();
                $table->text('content');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('user_roles')) {
            Schema::create('user_roles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('role', 32);
                $table->timestamps();
                $table->unique(['user_id','role']);
            });
        }

        if (!Schema::hasTable('notifications')) {
            Schema::create('notifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('type', 40);
                $table->json('payload')->nullable();
                $table->boolean('read')->default(false);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('favorites');
    }
};


