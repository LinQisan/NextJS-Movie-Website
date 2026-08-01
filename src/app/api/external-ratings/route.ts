import { type NextRequest } from 'next/server';

import {
  type ExternalRating,
  type ExternalRatingsResponse,
  type NextEpisode,
  type TVMazeInfo,
} from '@/lib/external-ratings';

const IMDB_GRAPHQL_URL = 'https://api.graphql.imdb.com/';
const TVMAZE_API_URL = 'https://api.tvmaze.com';
const OMDB_API_URL = 'https://www.omdbapi.com/';

type ImdbResponse = {
  data?: {
    title?: {
      ratingsSummary?: {
        aggregateRating?: number | null;
        voteCount?: number | null;
      };
    };
  };
};

type OmdbResponse = {
  Response?: string;
  Metascore?: string;
  Ratings?: { Source?: string; Value?: string }[];
};

type TVMazeShow = {
  id: number;
  name: string;
  url: string;
  status?: string;
  rating?: { average?: number | null };
  network?: { name?: string } | null;
  webChannel?: { name?: string } | null;
  schedule?: { days?: string[]; time?: string };
};

type TVMazeEpisode = {
  name?: string;
  season?: number;
  number?: number;
  airdate?: string;
};

export async function GET(request: NextRequest) {
  const imdbId = request.nextUrl.searchParams.get('imdb')?.trim() ?? '';
  const media = request.nextUrl.searchParams.get('media');

  if (!/^tt\d+$/.test(imdbId)) {
    return Response.json({ error: '无效的 IMDb ID。' }, { status: 400 });
  }

  const [imdbResult, omdbResult, tvmazeResult] = await Promise.allSettled([
    fetchImdbRating(imdbId),
    fetchOmdbRatings(imdbId),
    media === 'tv' ? fetchTVMazeInfo(imdbId) : Promise.resolve(null),
  ]);

  const ratings = [
    getFulfilled(imdbResult),
    ...(getFulfilled(omdbResult) ?? []),
  ].filter((rating): rating is ExternalRating => rating !== null);

  const uniqueRatings = [
    ...new Map(ratings.map((rating) => [rating.source, rating])).values(),
  ];

  const response: ExternalRatingsResponse = {
    ratings: uniqueRatings,
    tvmaze: getFulfilled(tvmazeResult),
  };

  return Response.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
    },
  });
}

async function fetchImdbRating(imdbId: string): Promise<ExternalRating | null> {
  const response = await fetch(IMDB_GRAPHQL_URL, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: 'https://www.imdb.com',
      Referer: 'https://www.imdb.com/',
      'User-Agent': 'Mozilla/5.0 (compatible; Reelmark/1.0)',
    },
    body: JSON.stringify({
      query: `query { title(id: "${imdbId}") { ratingsSummary { aggregateRating voteCount } } }`,
    }),
  });

  if (!response.ok) return null;

  const json = (await response.json()) as ImdbResponse;
  const summary = json.data?.title?.ratingsSummary;
  const score = Number(summary?.aggregateRating);

  if (!Number.isFinite(score) || score <= 0) return null;

  return {
    source: 'IMDb',
    score,
    scale: 10,
    votes: toPositiveInteger(summary?.voteCount),
    href: `https://www.imdb.com/title/${imdbId}/`,
  };
}

async function fetchOmdbRatings(imdbId: string): Promise<ExternalRating[]> {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) return [];

  const url = new URL(OMDB_API_URL);
  url.searchParams.set('i', imdbId);
  url.searchParams.set('apikey', apiKey);

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) return [];

  const json = (await response.json()) as OmdbResponse;
  if (json.Response !== 'True') return [];

  const ratings: ExternalRating[] = [];
  for (const item of json.Ratings ?? []) {
    const source = item.Source?.trim();
    const value = item.Value?.trim();
    if (!source || !value) continue;

    if (source === 'Rotten Tomatoes') {
      const score = Number(value.match(/\d+/)?.[0]);
      if (Number.isFinite(score)) {
        ratings.push({
          source,
          score,
          scale: 100,
          href: `https://www.rottentomatoes.com/search?search=${encodeURIComponent(imdbId)}`,
        });
      }
    }

    if (source === 'Metacritic') {
      const score = Number(value.match(/\d+/)?.[0]);
      if (Number.isFinite(score)) {
        ratings.push({
          source,
          score,
          scale: 100,
          href: `https://www.metacritic.com/search/${encodeURIComponent(imdbId)}/`,
        });
      }
    }
  }

  const metascore = Number(json.Metascore);
  if (
    Number.isFinite(metascore) &&
    metascore > 0 &&
    !ratings.some((rating) => rating.source === 'Metacritic')
  ) {
    ratings.push({
      source: 'Metacritic',
      score: metascore,
      scale: 100,
      href: `https://www.metacritic.com/search/${encodeURIComponent(imdbId)}/`,
    });
  }

  return ratings;
}

async function fetchTVMazeInfo(imdbId: string): Promise<TVMazeInfo | null> {
  const show = await fetchJson<TVMazeShow>(
    `${TVMAZE_API_URL}/lookup/shows?imdb=${encodeURIComponent(imdbId)}`,
  );
  if (!show?.id) return null;

  const episodes = await fetchJson<TVMazeEpisode[]>(
    `${TVMAZE_API_URL}/shows/${show.id}/episodes`,
  );
  const nextEpisode = findNextEpisode(episodes);
  const network = show.network?.name || show.webChannel?.name;

  return {
    name: show.name,
    href: show.url,
    rating: toPositiveNumber(show.rating?.average),
    status: show.status || undefined,
    network: network || undefined,
    schedule: show.schedule?.days?.length
      ? {
          days: show.schedule.days,
          time: show.schedule.time || '',
        }
      : undefined,
    nextEpisode: nextEpisode || undefined,
  };
}

function findNextEpisode(episodes?: TVMazeEpisode[] | null) {
  if (!Array.isArray(episodes)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextEpisode = episodes
    .filter((episode) => {
      if (!episode.airdate || !Number.isFinite(episode.season)) return false;
      const airdate = new Date(`${episode.airdate}T00:00:00`);
      return !Number.isNaN(airdate.getTime()) && airdate >= today;
    })
    .sort((a, b) => a.airdate!.localeCompare(b.airdate!))[0];

  return nextEpisode ? normalizeEpisode(nextEpisode) : null;
}

function normalizeEpisode(episode: TVMazeEpisode): NextEpisode | null {
  if (
    !episode.airdate ||
    !Number.isFinite(episode.season) ||
    !Number.isFinite(episode.number)
  ) {
    return null;
  }

  return {
    name: episode.name || `Episode ${episode.number}`,
    season: episode.season!,
    number: episode.number!,
    airdate: episode.airdate,
  };
}

async function fetchJson<T>(url: string) {
  const response = await fetch(url, {
    next: { revalidate: 21600 },
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

function getFulfilled<T>(result: PromiseSettledResult<T>) {
  return result.status === 'fulfilled' ? result.value : null;
}

function toPositiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function toPositiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}
