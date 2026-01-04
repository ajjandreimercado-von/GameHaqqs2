import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getGameById } from '@/lib/rawg-server';

export const dynamic = 'force-dynamic'; // Disable static generation for now
export const revalidate = 86400; // Revalidate every 24 hours

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params;
  const gameId = parseInt(id, 10);

  if (isNaN(gameId)) {
    notFound();
  }

  const game = await getGameById(gameId);

  if (!game) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section with Background */}
      <div className="relative h-[60vh] overflow-hidden">
        {game.background_image && (
          <>
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          </>
        )}
        
        {/* Back Button */}
        <Link
          href="/games"
          className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm hover:bg-black/70 rounded-lg text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </Link>

        {/* Game Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {game.name}
            </h1>
            {game.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-semibold text-lg">{game.rating}</span>
                  <span className="text-slate-300">/ 5</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {game.description_raw && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {game.description_raw}
                </p>
              </section>
            )}

            {/* Screenshots */}
            {game.short_screenshots && game.short_screenshots.length > 1 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">Screenshots</h2>
                <div className="grid grid-cols-2 gap-4">
                  {game.short_screenshots.slice(1, 5).map((screenshot) => (
                    <div key={screenshot.id} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={screenshot.image}
                        alt="Screenshot"
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Release Date */}
            {game.released && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Release Date</h3>
                <p className="text-white text-lg">
                  {new Date(game.released).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Platforms */}
            {game.platforms && game.platforms.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-slate-400 text-sm font-semibold mb-3">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((p) => (
                    <span
                      key={p.platform.id}
                      className="text-sm text-white bg-slate-700 px-3 py-1.5 rounded-md"
                    >
                      {p.platform.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {game.genres && game.genres.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-slate-400 text-sm font-semibold mb-3">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="text-sm text-blue-300 bg-blue-900/30 px-3 py-1.5 rounded-md"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Developers */}
            {game.developers && game.developers.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Developers</h3>
                <p className="text-white">
                  {game.developers.map(d => d.name).join(', ')}
                </p>
              </div>
            )}

            {/* Publishers */}
            {game.publishers && game.publishers.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-slate-400 text-sm font-semibold mb-2">Publishers</h3>
                <p className="text-white">
                  {game.publishers.map(p => p.name).join(', ')}
                </p>
              </div>
            )}

            {/* Website */}
            {game.website && (
              <a
                href={game.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-blue-600 hover:bg-blue-700 text-white text-center font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Visit Official Website →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const gameId = parseInt(id, 10);
  
  if (isNaN(gameId)) {
    return { title: 'Game Not Found' };
  }

  const game = await getGameById(gameId);
  
  if (!game) {
    return { title: 'Game Not Found' };
  }

  return {
    title: `${game.name} | GameHaqqs2`,
    description: game.description_raw?.slice(0, 160) || `Explore ${game.name}`,
  };
}
