import Link from 'next/link';
import { getPopularGames, getRecentGames } from '@/lib/rawg-server';
import { GameCard } from '@/components/GameCard';

export const dynamic = 'force-dynamic'; // Disable static generation for now
export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch both popular and recent games in parallel
  const [popularData, recentData] = await Promise.all([
    getPopularGames(12),
    getRecentGames(12),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              GameHaqqs2
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Discover, explore, and dive into the world of gaming with our comprehensive
              database of {popularData.count.toLocaleString()}+ games
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/games"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-500/30"
              >
                Browse All Games
              </Link>
              <Link
                href="/games/search"
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Search Games
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Popular Games</h2>
            <p className="text-slate-400">Top-rated games loved by millions</p>
          </div>
          <Link
            href="/games"
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularData.results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Recently Released */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Recently Released</h2>
            <p className="text-slate-400">Fresh releases from the past month</p>
          </div>
          <Link
            href="/games"
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2"
          >
            View All
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recentData.results.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Extensive Database</h3>
            <p className="text-slate-400">
              Access information on hundreds of thousands of games across all platforms and genres
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Lightning Fast</h3>
            <p className="text-slate-400">
              Server-side rendering and smart caching ensure blazing-fast load times
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure & Private</h3>
            <p className="text-slate-400">
              Built with security in mind - API keys and sensitive data never exposed to clients
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export const metadata = {
  title: 'GameHaqqs2 | Discover Amazing Games',
  description: 'Explore a comprehensive database of video games with detailed information, ratings, and more',
};
