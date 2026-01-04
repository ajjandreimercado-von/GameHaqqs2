import Link from 'next/link';
import Image from 'next/image';
import type { RawgGame } from '@/lib/rawg-server';

interface GameCardProps {
  game: RawgGame;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.id}`}>
      <div className="group bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
        {/* Game Image */}
        <div className="relative aspect-video bg-slate-900 overflow-hidden">
          {game.background_image ? (
            <Image
              src={game.background_image}
              alt={game.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}

          {/* Rating Badge */}
          {game.rating && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
              <svg
                className="w-4 h-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-sm font-semibold">{game.rating}</span>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {game.name}
          </h3>

          {/* Platforms */}
          {game.platforms && game.platforms.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {game.platforms.slice(0, 4).map((p) => (
                <span
                  key={p.platform.id}
                  className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded"
                >
                  {p.platform.name}
                </span>
              ))}
              {game.platforms.length > 4 && (
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
                  +{game.platforms.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Release Date */}
          {game.released && (
            <p className="text-slate-400 text-sm">
              Released: {new Date(game.released).toLocaleDateString()}
            </p>
          )}

          {/* Genres */}
          {game.genres && game.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {game.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
