<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add description, platform, image_url, and rating columns if they don't exist.
     */
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            // Add columns if they don't exist
            if (!Schema::hasColumn('games', 'description')) {
                $table->text('description')->nullable()->after('developer');
            }
            if (!Schema::hasColumn('games', 'platform')) {
                $table->string('platform')->nullable()->after('description');
            }
            if (!Schema::hasColumn('games', 'image_url')) {
                $table->string('image_url')->nullable()->after('platform');
            }
            if (!Schema::hasColumn('games', 'rating')) {
                $table->decimal('rating', 3, 1)->nullable()->after('image_url');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            if (Schema::hasColumn('games', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('games', 'platform')) {
                $table->dropColumn('platform');
            }
            if (Schema::hasColumn('games', 'image_url')) {
                $table->dropColumn('image_url');
            }
            if (Schema::hasColumn('games', 'rating')) {
                $table->dropColumn('rating');
            }
        });
    }
};
