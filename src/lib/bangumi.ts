import 'server-only';

import {
  chooseBangumiCandidate,
  normalizeBangumiTitle,
  type BangumiMatchCandidate,
  type BangumiMatchQuery,
} from './bangumi-match';
import type { BangumiAnimeInfo, BangumiCharacter } from './bangumi-types';

const BANGUMI_API_URL = 'https://api.bgm.tv';
const BANGUMI_SITE_URL = 'https://bgm.tv';
const DEFAULT_USER_AGENT =
  'Eiseki/0.1.0 (https://github.com/LinQisan/NextJS-Movie-Website)';
const SEARCH_CACHE_TTL = 24 * 60 * 60 * 1000;
const MAX_SEARCH_CACHE_ENTRIES = 128;

type BangumiImages = {
  large?: string;
  common?: string;
  medium?: string;
  small?: string;
  grid?: string;
};

type BangumiRating = {
  score?: number;
  rank?: number;
  total?: number;
};

type BangumiCollection = {
  collect?: number;
};

type BangumiTag = {
  name?: string;
};

type BangumiPerson = {
  id: number;
  name?: string;
  images?: BangumiImages | null;
};

type BangumiCharacterResponse = {
  id: number;
  name?: string;
  relation?: string;
  images?: BangumiImages | null;
  actors?: BangumiPerson[] | null;
};

type BangumiSubject = BangumiMatchCandidate & {
  id: number;
  type: number;
  summary?: string;
  eps?: number;
  total_episodes?: number;
  images?: BangumiImages | null;
  rating?: BangumiRating | null;
  collection?: BangumiCollection | null;
  tags?: BangumiTag[] | null;
};

type BangumiSearchResponse = {
  data?: BangumiSubject[];
};

type SearchCacheEntry = {
  expiresAt: number;
  value: Promise<BangumiSubject[]>;
};

const searchCache = new Map<string, SearchCacheEntry>();

/**
 * Find the most likely Bangumi animation for a TMDB item and normalize the
 * fields that the UI needs. Bangumi does not expose a stable TMDB ID, so the
 * title/year match is deliberately conservative and returns null when the
 * confidence is too low.
 */
export async function findBangumiAnime(
  query: BangumiMatchQuery,
): Promise<BangumiAnimeInfo | null> {
  const keywords = uniqueStrings([
    query.originalTitle,
    query.title,
    ...(query.titles ?? []),
  ]).slice(0, 3);

  if (keywords.length === 0) return null;

  const candidates = new Map<number, BangumiSubject>();
  for (const keyword of keywords) {
    const subjects = await searchBangumiSubjects(keyword);
    for (const subject of subjects) {
      if (subject.type === 2 && Number.isInteger(subject.id)) {
        candidates.set(subject.id, subject);
      }
    }
    if (candidates.size >= 8) break;
  }

  const candidate = chooseBangumiCandidate([...candidates.values()], query);
  if (!candidate) return null;

  const [subjectResult, charactersResult] = await Promise.allSettled([
    fetchBangumiSubject(candidate.id),
    fetchBangumiCharacters(candidate.id),
  ]);
  const subject =
    subjectResult.status === 'fulfilled' ? subjectResult.value : null;
  if (!subject) return null;
  const characters =
    charactersResult.status === 'fulfilled' ? charactersResult.value ?? [] : [];

  return normalizeBangumiSubject(subject, characters);
}

async function searchBangumiSubjects(keyword: string) {
  const cacheKey = normalizeBangumiTitle(keyword);
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const value = fetchBangumiJSON<BangumiSearchResponse>('/v0/search/subjects', {
    method: 'POST',
    body: JSON.stringify({
      keyword,
      sort: 'match',
      filter: { type: [2], nsfw: false },
    }),
    searchParams: { limit: 8, offset: 0 },
  })
    .then((response) => response?.data ?? [])
    .catch(() => []);

  trimSearchCache();
  searchCache.set(cacheKey, {
    expiresAt: Date.now() + SEARCH_CACHE_TTL,
    value,
  });
  return value;
}

async function fetchBangumiSubject(id: number) {
  return fetchBangumiJSON<BangumiSubject>(`/v0/subjects/${id}`, {
    method: 'GET',
  });
}

async function fetchBangumiCharacters(id: number) {
  return fetchBangumiJSON<BangumiCharacterResponse[]>(
    `/v0/subjects/${id}/characters`,
    { method: 'GET' },
  );
}

function normalizeBangumiSubject(
  subject: BangumiSubject,
  characters: BangumiCharacterResponse[],
): BangumiAnimeInfo {
  const image = subject.images?.large || subject.images?.common;

  return {
    id: subject.id,
    name: subject.name || subject.name_cn || `Bangumi #${subject.id}`,
    nameCn: subject.name_cn || undefined,
    summary: subject.summary?.trim() || undefined,
    date: subject.date || undefined,
    platform: subject.platform || undefined,
    episodes: positiveInteger(subject.eps),
    totalEpisodes: positiveInteger(subject.total_episodes),
    score: positiveNumber(subject.rating?.score),
    scoreVotes: positiveInteger(subject.rating?.total),
    rank: positiveInteger(subject.rating?.rank),
    collection: positiveInteger(subject.collection?.collect),
    tags: (subject.tags ?? [])
      .map((tag) => tag.name?.trim())
      .filter((tag): tag is string => Boolean(tag))
      .slice(0, 6),
    image: image ? toHttps(image) : undefined,
    characters: normalizeBangumiCharacters(characters),
    href: `${BANGUMI_SITE_URL}/subject/${subject.id}`,
  };
}

function normalizeBangumiCharacters(
  characters: BangumiCharacterResponse[],
): BangumiCharacter[] {
  return characters
    .filter((character) => Number.isInteger(character.id) && character.name)
    .slice(0, 16)
    .map((character) => {
      const actors = (character.actors ?? [])
        .filter((person) => Number.isInteger(person.id) && person.name)
        .slice(0, 4)
        .map((person) => ({
          id: person.id,
          name: person.name!,
          image: person.images?.large
            ? toHttps(person.images.large)
            : person.images?.common
              ? toHttps(person.images.common)
              : undefined,
        }));

      return {
        id: character.id,
        name: character.name!,
        relation: character.relation || undefined,
        image: character.images?.large
          ? toHttps(character.images.large)
          : character.images?.common
            ? toHttps(character.images.common)
            : undefined,
        actors,
      };
    });
}

async function fetchBangumiJSON<T>(
  path: string,
  options: {
    method: 'GET' | 'POST';
    body?: string;
    searchParams?: Record<string, string | number>;
  },
) {
  const url = new URL(`${BANGUMI_API_URL}${path}`);
  for (const [key, value] of Object.entries(options.searchParams ?? {})) {
    url.searchParams.set(key, String(value));
  }

  const token = process.env.BANGUMI_ACCESS_TOKEN?.trim();
  const response = await fetch(url, {
    method: options.method,
    body: options.body,
    cache: options.method === 'POST' ? 'no-store' : undefined,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      'User-Agent':
        process.env.BANGUMI_USER_AGENT?.trim() || DEFAULT_USER_AGENT,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: options.method === 'POST' ? undefined : { revalidate: 300 },
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

function trimSearchCache() {
  if (searchCache.size < MAX_SEARCH_CACHE_ENTRIES) return;
  const oldestKey = searchCache.keys().next().value;
  if (oldestKey) searchCache.delete(oldestKey);
}

function uniqueStrings(values: (string | undefined | null)[]) {
  return [
    ...new Set(values.map((value) => value?.trim()).filter(Boolean)),
  ] as string[];
}

function positiveNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function positiveInteger(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

function toHttps(value: string) {
  return value.startsWith('http://') ? `https://${value.slice(7)}` : value;
}
