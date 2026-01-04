// Server-only RAWG API service
// This file runs ONLY on the server, never in the browser
// API key is never exposed to the client

import 'server-only'; // Ensures this code never runs in the browser

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

if (!RAWG_API_KEY) {
  throw new Error('RAWG_API_KEY is not configured in environment variables');
}

export interface RawgGame {
  id: number;
  name: string;
  slug: string;
  background_image: string;
  rating: number;
  released: string;
  genres: Array<{ id: number; name: string; slug: string }>;
  platforms: Array<{ platform: { id: number; name: string } }>;
  metacritic?: number;
  playtime?: number;
  description_raw?: string;
  developers?: Array<{ id: number; name: string }>;
  publishers?: Array<{ id: number; name: string }>;
  website?: string;
  short_screenshots?: Array<{ id: number; image: string }>;
}

export interface RawgResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

/**
 * Fetch games from RAWG API (server-side only)
 * This function is marked with 'server-only' to ensure it never runs in the browser
 */
export async function getGamesFromRAWG(params?: {
  search?: string;
  genres?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}): Promise<RawgResponse> {
  const queryParams = new URLSearchParams({
    key: RAWG_API_KEY!,
    page_size: params?.page_size?.toString() || '20',
    page: params?.page?.toString() || '1',
  });

  if (params?.search) queryParams.append('search', params.search);
  if (params?.genres) queryParams.append('genres', params.genres);
  if (params?.ordering) queryParams.append('ordering', params.ordering);

  const url = `${RAWG_BASE_URL}/games?${queryParams.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour (ISR)
  });

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get popular games (server-side only)
 */
export async function getPopularGames(limit: number = 20): Promise<RawgResponse> {
  return getGamesFromRAWG({
    page_size: limit,
    ordering: '-rating,-metacritic',
  });
}

/**
 * Get a single game by ID (server-side only)
 */
export async function getGameById(id: number): Promise<RawgGame> {
  const url = `${RAWG_BASE_URL}/games/${id}?key=${RAWG_API_KEY}`;

  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Search games (server-side only)
 */
export async function searchGames(query: string, page: number = 1): Promise<RawgResponse> {
  return getGamesFromRAWG({
    search: query,
    page,
    page_size: 20,
  });
}

/**
 * Get recent games (server-side only)
 */
export async function getRecentGames(limit: number = 20): Promise<RawgResponse> {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const today = new Date();

  const dates = `${oneMonthAgo.toISOString().split('T')[0]},${today.toISOString().split('T')[0]}`;

  const queryParams = new URLSearchParams({
    key: RAWG_API_KEY!,
    page_size: limit.toString(),
    dates,
    ordering: '-released',
  });

  const url = `${RAWG_BASE_URL}/games?${queryParams.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get upcoming games (server-side only)
 */
export async function getUpcomingGames(limit: number = 20): Promise<RawgResponse> {
  const today = new Date();
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

  const dates = `${today.toISOString().split('T')[0]},${threeMonthsLater.toISOString().split('T')[0]}`;

  const queryParams = new URLSearchParams({
    key: RAWG_API_KEY!,
    page_size: limit.toString(),
    dates,
    ordering: 'released',
  });

  const url = `${RAWG_BASE_URL}/games?${queryParams.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }

  return response.json();
}
