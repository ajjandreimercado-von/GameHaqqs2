<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('likes')) {
            return;
        }

        if (!Schema::hasColumn('likes', 'likeable_type') || !Schema::hasColumn('likes', 'likeable_id')) {
            Schema::table('likes', function (Blueprint $table) {
                $table->string('likeable_type')->nullable()->after('tip_id');
                $table->unsignedBigInteger('likeable_id')->nullable()->after('likeable_type');
            });

            // Backfill existing review_id and tip_id into polymorphic columns
            DB::table('likes')->whereNotNull('review_id')->update([
                'likeable_type' => '\\App\\Models\\Review',
                'likeable_id' => DB::raw('review_id'),
            ]);

            DB::table('likes')->whereNotNull('tip_id')->update([
                'likeable_type' => '\\App\\Models\\TipAndTrick',
                'likeable_id' => DB::raw('tip_id'),
            ]);

            // Add index for faster polymorphic lookups
            Schema::table('likes', function (Blueprint $table) {
                $table->index(['likeable_type', 'likeable_id']);
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('likes')) {
            return;
        }

        Schema::table('likes', function (Blueprint $table) {
            if (Schema::hasColumn('likes', 'likeable_type')) {
                $table->dropIndex(['likeable_type', 'likeable_id']);
                $table->dropColumn(['likeable_type', 'likeable_id']);
            }
        });
    }
};
