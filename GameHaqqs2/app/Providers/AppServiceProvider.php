<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Force file cache as default at runtime to avoid DB cache dependency
        if (Config::get('cache.default') !== 'file') {
            Config::set('cache.default', 'file');
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (Config::get('cache.default') !== 'file') {
            Config::set('cache.default', 'file');
        }
    }
}
