import { getPopularGames } from '@/lib/rawg-server';
import { GameCard } from '@/components/GameCard';
import { SearchBar } from '@/components/SearchBar';

export const dynamic = 'force-dynamic'; // Disable static generation for now
export const revalidate = 3600; // Revalidate every hour

export default async function GamesPage() {
  // This runs on the server - API key never exposed to client
  const data = await getPopularGames(100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Game Library
          </h1>
          <p className="text-slate-400">
            Discover and explore {data.count.toLocaleString()} amazing games
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-12 p-6 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-white font-semibold mb-1">
                🔒 Secure Server-Side Rendering
              </h3>
              <p className="text-slate-300 text-sm">
                This page is rendered on the server using Next.js Server Components.
                The RAWG API key is never exposed to the browser - all API calls
                happen securely on Vercel's edge network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Game Library | GameHaqqs2',
  description: 'Browse thousands of games from the RAWG database',
};
