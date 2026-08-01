import { type NextRequest } from 'next/server';

import {
  createDoubanRatingSnapshot,
  parseDoubanWebSearch,
  parseDoubanRating,
  selectDoubanSuggestion,
  type DoubanSelectionOptions,
  type DoubanSuggestion,
  type DoubanRatingResponse,
} from '@/lib/douban-trend';

const DOUBAN_SUGGEST_URL = 'https://movie.douban.com/j/subject_suggest';
const DOUBAN_SEARCH_URL = 'https://m.douban.com/rexxar/api/v2/search';
const DOUBAN_WEB_SEARCH_URL = 'https://www.douban.com/search';
const ZDUO_URL = 'https://zduo.me/2020/doubanqushi/api.php';
const UPSTREAM_TIMEOUT = 7_000;
const RESPONSE_HEADERS = {
  'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400',
};

type DoubanSuggestResponse = {
  id?: string;
  title?: string;
  sub_title?: string;
  year?: string;
  episode?: string;
};

type DoubanSearchResponse = {
  subjects?: {
    items?: {
      target_type?: string;
      target?: {
        id?: string;
        title?: string;
        year?: string;
        uri?: string;
      };
    }[];
  };
};

type DoubanSubjectSearchResponse = {
  items?: {
    id?: number;
    title?: string;
    labels?: { text?: string }[];
    rating?: { value?: number; count?: number };
  }[];
};

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title')?.trim() ?? '';
  const originalTitle =
    request.nextUrl.searchParams.get('originalTitle')?.trim() ?? '';
  const alternateTitles = parseTitleList(
    request.nextUrl.searchParams.get('titles'),
  );
  const year = request.nextUrl.searchParams.get('year')?.trim() ?? '';
  const media = request.nextUrl.searchParams.get('media');

  if (
    title.length < 2 ||
    title.length > 180 ||
    (originalTitle && originalTitle.length > 180) ||
    (year !== '' && !/^\d{4}$/.test(year)) ||
    (media !== 'movie' && media !== 'tv')
  ) {
    return Response.json({ rating: null } satisfies DoubanRatingResponse, {
      status: 400,
      headers: RESPONSE_HEADERS,
    });
  }

  const queries = createSearchQueries(title, originalTitle, alternateTitles);
  const selectionOptions = {
    title,
    originalTitle,
    titles: alternateTitles,
    year,
    media,
  } satisfies DoubanSelectionOptions;
  let suggestions = await fetchSuggestions(queries, selectionOptions);
  let htmlSuggestions: DoubanSuggestion[] | null = null;
  const loadHtmlSuggestions = async () => {
    htmlSuggestions ??= (
      await Promise.all(queries.slice(0, 3).map(fetchSearchPageEndpoint))
    ).flat();
    return htmlSuggestions ?? [];
  };

  let suggestion = selectDoubanSuggestion(suggestions, selectionOptions);

  if (!suggestion) {
    suggestions = [...suggestions, ...(await loadHtmlSuggestions())];
    suggestion = selectDoubanSuggestion(suggestions, selectionOptions);
  }

  if (!suggestion) {
    return Response.json({ rating: null } satisfies DoubanRatingResponse, {
      headers: RESPONSE_HEADERS,
    });
  }

  let ratingResponse = await fetchZduoRating(suggestion.id);
  let rating = ratingResponse
    ? parseDoubanRating(ratingResponse, suggestion)
    : null;

  // subject_suggest often returns a season without its rating. If the rating
  // endpoint has no record for that season, enrich the candidate from the
  // regular Douban search page before falling back to a score-only snapshot.
  if (!rating && !suggestion.score) {
    const fallbackSuggestions = await loadHtmlSuggestions();
    const enrichedSuggestion = selectDoubanSuggestion(
      [...suggestions, ...fallbackSuggestions],
      selectionOptions,
    );
    if (enrichedSuggestion) {
      const subjectChanged = suggestion.id !== enrichedSuggestion.id;
      suggestion = enrichedSuggestion;
      if (subjectChanged) {
        ratingResponse = await fetchZduoRating(suggestion.id);
      }
      rating = ratingResponse
        ? parseDoubanRating(ratingResponse, suggestion)
        : null;
    }
  }

  rating ??= createDoubanRatingSnapshot(suggestion);

  return Response.json({ rating } satisfies DoubanRatingResponse, {
    headers: RESPONSE_HEADERS,
  });
}

function parseTitleList(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(
        (item, index, items) =>
          item.length >= 2 &&
          item.length <= 180 &&
          items.indexOf(item) === index,
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

function createSearchQueries(
  title: string,
  originalTitle: string,
  alternateTitles: string[],
) {
  const values = [title, originalTitle, ...alternateTitles]
    .filter(Boolean)
    .filter(
      (value, index, items) =>
        items.findIndex(
          (item) => item.toLocaleLowerCase() === value.toLocaleLowerCase(),
        ) === index,
    )
    .slice(0, 6);
  const queries = [...values];

  // The suggestion endpoint is more reliable with the meaningful part of an
  // English title (for example, "Matrix" instead of "The Matrix"). The full
  // title is still used for matching, so this fallback cannot lower confidence.
  values.slice(0, 2).forEach((value) => {
    const tokens = value
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(
        (token) => token.length >= 4 && !/^(the|and|with|from)$/i.test(token),
      )
      .sort((first, second) => second.length - first.length);
    if (tokens[0]) queries.push(tokens[0]);
  });

  return queries
    .filter(
      (query, index) =>
        queries.findIndex(
          (item) => item.toLocaleLowerCase() === query.toLocaleLowerCase(),
        ) === index,
    )
    .slice(0, 8);
}

async function fetchSuggestions(
  queries: string[],
  selectionOptions: DoubanSelectionOptions,
) {
  const suggestions = new Map<string, DoubanSuggestion>();

  // Douban rate-limits bursts of subject searches. Query titles in priority
  // order and stop as soon as one query produces a year/type-safe match.
  for (const query of queries) {
    const results = await fetchSuggestionsForQuery(query);
    results.forEach((item) => suggestions.set(item.id, item));

    if (selectDoubanSuggestion([...suggestions.values()], selectionOptions)) {
      break;
    }
  }

  return [...suggestions.values()];
}

async function fetchSuggestionsForQuery(query: string) {
  const suggestions = await fetchSuggestEndpoint(query);
  if (suggestions.length > 0) return suggestions;

  // The JSON search endpoints now commonly require a logged-in Douban
  // session. The public www search page remains usable and includes subject
  // ids plus rating metadata, so prefer it before the restricted endpoints.
  const webSuggestions = await fetchWebSearchEndpoint(query);
  if (webSuggestions.length > 0) return webSuggestions;

  const searchSuggestions = await fetchSearchEndpoint(query);
  if (searchSuggestions.length > 0) return searchSuggestions;
  return fetchSubjectSearchEndpoint(query);
}

async function fetchSuggestEndpoint(query: string) {
  const url = new URL(DOUBAN_SUGGEST_URL);
  url.searchParams.set('q', query);
  const response = await fetchJson<DoubanSuggestResponse[]>(url, {
    Accept: 'application/json',
  });

  if (!Array.isArray(response)) return [];
  return response
    .map<DoubanSuggestion>((item) => ({
      id: item.id?.trim() ?? '',
      title: item.title?.trim() ?? '',
      subtitle: item.sub_title?.trim() || undefined,
      year: item.year?.trim() || undefined,
      episode: item.episode?.trim() || undefined,
    }))
    .filter((item) => Boolean(item.id && item.title));
}

async function fetchSearchEndpoint(query: string) {
  const url = new URL(DOUBAN_SEARCH_URL);
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'movie');
  const response = await fetchJson<DoubanSearchResponse>(url, {
    Accept: 'application/json',
    Referer: 'https://m.douban.com/',
  });

  const items = response?.subjects?.items;
  if (!Array.isArray(items)) return [];

  return items
    .map<DoubanSuggestion | null>((item) => {
      const target = item.target;
      const targetType = item.target_type?.toLocaleLowerCase();
      const uriType = target?.uri?.match(/douban\.com\/(movie|tv)\//)?.[1];
      if (
        (targetType && !['movie', 'tv'].includes(targetType)) ||
        (uriType && !['movie', 'tv'].includes(uriType))
      ) {
        return null;
      }
      const id = target?.id || target?.uri?.match(/\/(\d+)$/)?.[1] || '';
      return {
        id,
        title: target?.title?.trim() ?? '',
        year: target?.year?.trim() || undefined,
      } satisfies DoubanSuggestion;
    })
    .filter((item): item is DoubanSuggestion =>
      Boolean(item?.id && item.title),
    );
}

async function fetchWebSearchEndpoint(query: string) {
  const url = new URL(DOUBAN_WEB_SEARCH_URL);
  url.searchParams.set('cat', '1002');
  url.searchParams.set('q', query);
  const html = await fetchText(url, {
    Accept: 'text/html,application/xhtml+xml',
    Referer: 'https://www.douban.com/',
  });
  return html ? parseDoubanWebSearch(html) : [];
}

async function fetchSearchPageEndpoint(query: string) {
  const webSuggestions = await fetchWebSearchEndpoint(query);
  if (webSuggestions.length > 0) return webSuggestions;
  return fetchSubjectSearchEndpoint(query);
}

async function fetchSubjectSearchEndpoint(query: string) {
  const url = new URL('https://movie.douban.com/subject_search');
  url.searchParams.set('search_text', query);
  url.searchParams.set('cat', '1002');
  const html = await fetchText(url, {
    Accept: 'text/html,application/xhtml+xml',
    Referer: 'https://movie.douban.com/',
  });
  if (!html) return [];

  const dataStart = html.indexOf('window.__DATA__');
  const userStart = html.indexOf('window.__USER__', dataStart);
  if (dataStart < 0 || userStart < 0) return [];

  const assignmentEnd = html.indexOf('=', dataStart);
  const jsonText = html
    .slice(assignmentEnd + 1, userStart)
    .trim()
    .replace(/;\s*$/, '');

  try {
    const data = JSON.parse(jsonText) as DoubanSubjectSearchResponse;
    return (data.items ?? [])
      .map((item) => {
        const title = item.title?.trim() ?? '';
        const year = title.match(/\((\d{4})\)[^\d]*$/)?.[1];
        const isSeries = item.labels?.some((label) => label.text === '剧集');
        return {
          id: item.id ? String(item.id) : '',
          title,
          year,
          episode: isSeries ? '1' : undefined,
          score: Number(item.rating?.value) || undefined,
          votes: Number(item.rating?.count) || undefined,
        } satisfies DoubanSuggestion;
      })
      .filter((item) => Boolean(item.id && item.title));
  } catch {
    return [];
  }
}

async function fetchZduoRating(subjectId: string) {
  const url = new URL(ZDUO_URL);
  // Douban films and series are both stored as movie subjects on the source.
  url.searchParams.set('subject_type', 'movie');
  url.searchParams.set('subject_id', subjectId);
  url.searchParams.set('rd', String(Date.now()));

  return fetchJson<Parameters<typeof parseDoubanRating>[0]>(url, {
    Accept: 'application/json',
    Referer: 'https://movie.douban.com/',
  });
}

async function fetchJson<T>(url: URL, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        ...headers,
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url: URL, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        ...headers,
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      },
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
