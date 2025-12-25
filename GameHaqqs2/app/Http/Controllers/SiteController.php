<?php

namespace App\Http\Controllers;

use App\Models\Game;
use Illuminate\View\View;

class SiteController extends Controller
{
    /**
     * Display the homepage with paginated games.
     */
    public function index(): View
    {
        $games = Game::with(['reviews', 'wikis', 'tipsAndTricks'])->paginate(10);
        return view('home', compact('games'));
    }
}



