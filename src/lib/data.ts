import 'server-only';
import { cookies } from 'next/headers';
import { rankMovies } from './search-ranking';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  localeConfig,
  localeFromValue,
} from './i18n';

const TMDB_API_URL = 'https://api.themoviedb.org/3';

type BaseMedia = {
  backdrop_path?: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  overview: string;
  popularity: number;
  poster_path?: string | null;
  vote_average: number;
  vote_count: number;
};

export type Movie = BaseMedia & {
  original_title: string;
  release_date: string;
  title: string;
  video: boolean;
};

export type TV = BaseMedia & {
  origin_country: string[];
  original_name: string;
  first_air_date: string;
  name: string;
};

export type Media = Movie | TV;

type Genre = { id: number; name: string };
type ProductionCompany = { id: number; name: string };
type TranslationData = {
  title?: string;
  name?: string;
};
type Translation = {
  iso_639_1: string;
  iso_3166_1: string;
  data: TranslationData;
};
export type MediaTranslations = {
  translations?: Translation[];
};

export type TVDetail = {
  backdrop_path?: string | null;
  first_air_date: string;
  genres: Genre[];
  id: number;
  name: string;
  original_name: string;
  tagline?: string;
  content_ratings: {
    results?: { iso_3166_1: string; rating: string }[];
  };
  vote_average: number;
  vote_count: number;
  overview: string;
  translations?: MediaTranslations;
  production_companies: ProductionCompany[];
  seasons: Season[];
  external_ids?: {
    imdb_id?: string | null;
  };
};

export type MovieDetail = {
  backdrop_path?: string | null;
  release_date: string;
  genres: Genre[];
  id: number;
  title: string;
  runtime: number;
  original_title: string;
  tagline?: string;
  release_dates: {
    results?: {
      iso_3166_1: string;
      release_dates: { certification: string }[];
    }[];
  };
  vote_average: number;
  vote_count: number;
  overview: string;
  translations?: MediaTranslations;
  production_companies: ProductionCompany[];
  revenue?: number;
  budget?: number;
  credits: MovieCredits;
  external_ids?: {
    imdb_id?: string | null;
  };
};

export type Season = {
  id: number;
  name: string;
  episode_count: number;
  season_number: number;
};

export type Episode = {
  id: number;
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  runtime: number | null;
  season_number: number;
  vote_average: number;
};

export type SeasonDetail = {
  id: number;
  name: string;
  episodes: Episode[];
  season_number: number;
};

export type TVCredits = {
  cast: {
    id: number;
    name: string;
    profile_path?: string | null;
    known_for_department: string;
    roles: { character: string }[];
  }[];
  crew: {
    id: number;
    name: string;
    profile_path?: string | null;
    jobs: { credit_id: string; job: string }[];
  }[];
};

export type MovieCredits = {
  cast: {
    credit_id: string;
    id: number;
    name: string;
    profile_path?: string | null;
    known_for_department: string;
    character: string;
  }[];
  crew: {
    credit_id: string;
    id: number;
    name: string;
    profile_path?: string | null;
    job: string;
  }[];
};

type TMDBList<T> = {
  page: number;
  results: T[];
  total_pages: number;
};

type FetchOptions = {
  cache?: RequestCache;
  revalidate?: number;
  searchParams?: Record<string, string | number | boolean>;
};

export class TMDBError extends Error {
  constructor(
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = 'TMDBError';
  }
}

async function tmdbFetch<T>(path: string, options: FetchOptions = {}) {
  const token = process.env.TMDB_Bearer;
  if (!token) {
    throw new TMDBError('缺少 TMDB_Bearer 环境变量。');
  }

  const locale = localeFromValue(
    (await cookies()).get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE,
  );

  const url = new URL(`${TMDB_API_URL}${path}`);
  Object.entries({
    language: localeConfig[locale].tmdb,
    ...options.searchParams,
  }).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const response = await fetch(url, {
    cache: options.cache,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    next:
      options.revalidate === undefined
        ? undefined
        : { revalidate: options.revalidate },
  });

  if (!response.ok) {
    let reason = response.statusText;
    try {
      const body = (await response.json()) as { status_message?: string };
      reason = body.status_message || reason;
    } catch {
      // Keep the HTTP status text when the upstream response is not JSON.
    }
    throw new TMDBError(`TMDB 请求失败：${reason}`, response.status);
  }

  return (await response.json()) as T;
}

function numericPathSegment(value: string, label: string) {
  if (!/^\d+$/.test(value)) {
    throw new TMDBError(`${label} 必须是非负整数。`, 400);
  }
  return value;
}

function uniqueMediaById<T extends { id: number }>(items: T[]) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export function getTranslationTitles(
  translations: MediaTranslations | undefined,
  field: 'title' | 'name',
) {
  return [...(translations?.translations ?? [])]
    .sort(
      (first, second) =>
        translationPriority(first) - translationPriority(second),
    )
    .map((translation) => translation.data[field]?.trim() ?? '')
    .filter(
      (title, index, titles) =>
        title.length >= 2 && titles.indexOf(title) === index,
    )
    .slice(0, 6);
}

function translationPriority(translation: Translation) {
  const locale = `${translation.iso_639_1}-${translation.iso_3166_1}`;
  return (
    {
      'zh-CN': 0,
      'zh-TW': 1,
      'ja-JP': 2,
      'en-US': 3,
      'en-GB': 4,
    }[locale] ?? 10
  );
}

export function getTrending(media: 'movie'): Promise<Movie[]>;
export function getTrending(media: 'tv'): Promise<TV[]>;
export async function getTrending(media: 'movie' | 'tv') {
  const data = await tmdbFetch<TMDBList<Movie | TV>>(
    `/trending/${media}/week`,
    { revalidate: 1800 },
  );
  return uniqueMediaById(data.results);
}

export async function fetchMoviesName(query: string) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];

  const firstPage = await searchMoviesPage(normalizedQuery, 1);
  const pageCount = Math.min(firstPage.total_pages, 3);
  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      searchMoviesPage(normalizedQuery, index + 2),
    ),
  );
  const movies = [firstPage, ...remainingPages].flatMap((page) => page.results);

  return rankMovies(uniqueMediaById(movies), normalizedQuery);
}

function searchMoviesPage(query: string, page: number) {
  return tmdbFetch<TMDBList<Movie>>('/search/movie', {
    cache: 'no-store',
    searchParams: { query, include_adult: false, page },
  });
}

export async function fetchTVName(query: string) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];

  const data = await tmdbFetch<TMDBList<TV>>('/search/tv', {
    cache: 'no-store',
    searchParams: { query: normalizedQuery, include_adult: false, page: 1 },
  });
  return uniqueMediaById(data.results);
}

export function getMovieDetails(id: string) {
  return tmdbFetch<MovieDetail>(`/movie/${numericPathSegment(id, '电影 ID')}`, {
    revalidate: 86400,
    searchParams: {
      append_to_response: 'release_dates,credits,external_ids,translations',
    },
  });
}

export function fetchTVDetails(id: string) {
  return tmdbFetch<TVDetail>(`/tv/${numericPathSegment(id, '电视剧 ID')}`, {
    revalidate: 86400,
    searchParams: {
      append_to_response: 'content_ratings,external_ids,translations',
    },
  });
}

export function getTVCredits(id: string) {
  return tmdbFetch<TVCredits>(
    `/tv/${numericPathSegment(id, '电视剧 ID')}/aggregate_credits`,
    { revalidate: 86400 },
  );
}

export function getSeasonDetail(id: string, seasonNumber: string) {
  return tmdbFetch<SeasonDetail>(
    `/tv/${numericPathSegment(id, '电视剧 ID')}/season/${numericPathSegment(seasonNumber, '季数')}`,
    { revalidate: 86400 },
  );
}
