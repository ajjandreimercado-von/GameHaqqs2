<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('admins')) {
            Schema::create('admins', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->unsignedTinyInteger('role_level')->default(1);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('moderators')) {
            Schema::create('moderators', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('assigned_category')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('posts')) {
            Schema::create('posts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('moderator_id')->nullable()->constrained('moderators')->nullOnDelete();
                $table->string('title');
                $table->text('content');
                $table->enum('status', ['pending','approved','declined'])->default('pending');
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
        Schema::dropIfExists('moderators');
        Schema::dropIfExists('admins');
    }
};


