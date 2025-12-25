<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tags')) {
            Schema::create('tags', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50)->unique();
            });
        }

        if (!Schema::hasTable('game_tags')) {
            Schema::create('game_tags', function (Blueprint $table) {
                $table->id();
                $table->foreignId('game_id')->constrained('games')->cascadeOnDelete();
                $table->foreignId('tag_id')->constrained('tags')->cascadeOnDelete();
                $table->timestamps();
                $table->unique(['game_id', 'tag_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('game_tags');
        Schema::dropIfExists('tags');
    }
};


