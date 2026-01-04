<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            // Add RAWG API specific fields (only if they don't exist)
            if (!Schema::hasColumn('games', 'rawg_id')) {
                $table->integer('rawg_id')->nullable()->unique()->after('id');
            }
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
                $table->decimal('rating', 3, 2)->default(0)->after('image_url');
            }
            if (!Schema::hasColumn('games', 'external_data')) {
                $table->json('external_data')->nullable()->after('rating');
            }
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $columnsToRemove = [];
            
            if (Schema::hasColumn('games', 'rawg_id')) {
                $columnsToRemove[] = 'rawg_id';
            }
            // Don't remove description, platform, image_url, rating if they were added by other migrations
            if (Schema::hasColumn('games', 'external_data')) {
                $columnsToRemove[] = 'external_data';
            }
            
            if (!empty($columnsToRemove)) {
                $table->dropColumn($columnsToRemove);
            }
        });
    }
};
