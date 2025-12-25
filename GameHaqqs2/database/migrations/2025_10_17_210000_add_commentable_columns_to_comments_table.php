<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('comments')) {
            return;
        }

        if (!Schema::hasColumn('comments', 'commentable_type') || !Schema::hasColumn('comments', 'commentable_id')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->string('commentable_type')->nullable()->after('post_id');
                $table->unsignedBigInteger('commentable_id')->nullable()->after('commentable_type');
            });

            // Backfill existing relationships
            DB::table('comments')->whereNotNull('review_id')->update([
                'commentable_type' => '\\App\\Models\\Review',
                'commentable_id' => DB::raw('review_id'),
            ]);

            DB::table('comments')->whereNotNull('tip_id')->update([
                'commentable_type' => '\\App\\Models\\TipAndTrick',
                'commentable_id' => DB::raw('tip_id'),
            ]);

            DB::table('comments')->whereNotNull('post_id')->update([
                'commentable_type' => '\\App\\Models\\Post',
                'commentable_id' => DB::raw('post_id'),
            ]);

            Schema::table('comments', function (Blueprint $table) {
                $table->index(['commentable_type', 'commentable_id']);
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('comments')) {
            return;
        }

        Schema::table('comments', function (Blueprint $table) {
            if (Schema::hasColumn('comments', 'commentable_type')) {
                $table->dropIndex(['commentable_type', 'commentable_id']);
                $table->dropColumn(['commentable_type', 'commentable_id']);
            }
        });
    }
};
