<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // If there's an existing tags table using `tag_id` as primary key
        // convert it to the conventional `id` primary key so Eloquent
        // and foreign key constraints work as expected.

        if (!Schema::hasTable('tags')) {
            // Nothing to do.
            return;
        }

        $hasTagId = Schema::hasColumn('tags', 'tag_id');
        $hasId = Schema::hasColumn('tags', 'id');

        if ($hasTagId && !$hasId) {
            // MySQL requires changing the column type to have AUTO_INCREMENT
            // and renaming. Wrap in try/catch to avoid failing on unexpected
            // environments. We also drop and recreate the game_tags foreign
            // key if necessary.

            DB::beginTransaction();
            try {
                // Temporarily disable foreign key checks while renaming
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');

                // If game_tags exists and has a FK referencing tags(tag_id), try to drop it.
                if (Schema::hasTable('game_tags') && Schema::hasColumn('game_tags', 'tag_id')) {
                    // Attempt to drop the foreign key if it exists. FK name may vary;
                    // common Laravel name is game_tags_tag_id_foreign.
                    try {
                        DB::statement('ALTER TABLE `game_tags` DROP FOREIGN KEY `game_tags_tag_id_foreign`;');
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                // Rename the primary key column to `id` and make it unsigned big integer auto-increment.
                // This will preserve the numeric values.
                DB::statement('ALTER TABLE `tags` CHANGE `tag_id` `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;');

                // Recreate the Laravel-friendly index/unique if missing
                if (!Schema::hasColumn('tags', 'name')) {
                    // nothing else to do
                }

                // Recreate the foreign key on game_tags to reference tags.id
                if (Schema::hasTable('game_tags') && Schema::hasColumn('game_tags', 'tag_id')) {
                    try {
                        DB::statement('ALTER TABLE `game_tags` ADD CONSTRAINT `game_tags_tag_id_foreign` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE;');
                    } catch (\Throwable $e) {
                        // ignore
                    }
                }

                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
                DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                // Do not throw so that developers can inspect and run the appropriate SQL manually.
                // Log to the default log channel if available.
                try { logger()->error('tags normalization migration failed: '.$e->getMessage()); } catch (\Throwable $_) {}
            }
        }
    }

    public function down(): void
    {
        // We intentionally do not reverse this operation automatically.
    }
};
