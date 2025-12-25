<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('moderator_actions')) {
            Schema::create('moderator_actions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('moderator_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('post_id')->constrained('posts')->onDelete('cascade');
                $table->enum('action', ['approve', 'decline']);
                $table->text('reason')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('moderator_actions');
    }
};
