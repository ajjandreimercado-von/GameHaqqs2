import { searchGames } from '@/lib/rawg-server';
import { GameCard } from '@/components/GameCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic'; // Disable static generation for now
export const revalidate = 1800; // Revalidate every 30 minutes

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q || '';

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Library
          </Link>
          
          <div className="text-center py-20">
            <svg
              className="w-20 h-20 text-slate-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No search query provided</h2>
            <p className="text-slate-400">Please enter a search term to find games</p>
          </div>
        </div>
      </div>
    );
  }

  const data = await searchGames(query, 50);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-slate-400">
            Found {data.count.toLocaleString()} {data.count === 1 ? 'game' : 'games'}
          </p>
        </div>

        {/* Results */}
        {data.results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.results.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg
              className="w-20 h-20 text-slate-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">No games found</h2>
            <p className="text-slate-400">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q || '';
  
  return {
    title: query ? `Search: ${query} | GameHaqqs2` : 'Search Games | GameHaqqs2',
    description: `Search results for ${query}`,
  };
}
