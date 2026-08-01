export type DoubanSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  year?: string;
  episode?: string;
  score?: number;
  votes?: number;
};

export type DoubanRating = {
  subjectId: string;
  subjectTitle: string;
  subjectYear?: string;
  sourceUrl: string;
  score: number;
  votes?: number;
};

export type DoubanRatingResponse = {
  rating: DoubanRating | null;
};

export type DoubanSelectionOptions = {
  title: string;
  originalTitle?: string;
  titles?: string[];
  year?: string;
  media: 'movie' | 'tv';
};

type ZduoChart = {
  series?: { data?: unknown[] }[];
};

export type ZduoRatingResponse = {
  code?: string | number;
  data?: {
    day_rate?: ZduoChart;
  };
};

export function normalizeDoubanText(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '');
}

/**
 * Select a high-confidence suggestion without relying on the order returned
 * by Douban's search endpoint. A year mismatch is rejected so a remake or a
 * similarly named series cannot silently receive the wrong score.
 */
export function selectDoubanSuggestion(
  suggestions: DoubanSuggestion[],
  options: DoubanSelectionOptions,
) {
  const queries = [
    options.title,
    options.originalTitle,
    ...(options.titles ?? []),
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeDoubanText)
    .filter(
      (value, index, values) =>
        value.length >= 2 && values.indexOf(value) === index,
    );
  const expectedYear = options.year?.match(/\d{4}/)?.[0];

  if (queries.length === 0) return null;

  return (
    suggestions
      .map((suggestion) => {
        const fields = [suggestion.title, suggestion.subtitle]
          .filter((value): value is string => Boolean(value?.trim()))
          .map(normalizeDoubanText);
        const exact = queries.some((query) => fields.includes(query));
        const contains = queries.some((query) =>
          fields.some(
            (field) => field.includes(query) || query.includes(field),
          ),
        );
        const yearMatches =
          !expectedYear || !suggestion.year || suggestion.year === expectedYear;
        if (!yearMatches) return { suggestion, score: -Infinity };

        let score = exact ? 120 : contains ? 72 : 0;
        if (expectedYear && suggestion.year === expectedYear) score += 34;
        if (options.media === 'tv' && suggestion.episode) score += 4;
        if (options.media === 'movie' && !suggestion.episode) score += 4;

        return { suggestion, score };
      })
      .filter(({ score }) => Number.isFinite(score) && score >= 100)
      .sort((first, second) => second.score - first.score)[0]?.suggestion ??
    null
  );
}

/**
 * Parse the server-rendered result list from www.douban.com/search. The
 * subject-search page is frequently rate-limited, while this older search
 * page still exposes the subject id, translated title, year and rating in
 * ordinary HTML.
 */
export function parseDoubanWebSearch(html: string) {
  const starts = [...html.matchAll(/<div\s+class=["']result["'][^>]*>/gi)]
    .map((match) => match.index)
    .filter((index): index is number => index !== undefined);

  return starts
    .map((start, index): DoubanSuggestion | null => {
      const block = html.slice(start, starts[index + 1] ?? html.length);
      const id = block.match(/subject(?:%2F|\/)(\d+)(?:%2F|\/)/i)?.[1] ?? '';
      if (!id) return null;

      const titleAttribute = block.match(
        /<a[^>]*class=["']nbg["'][^>]*title=["']([^"']*)["']/i,
      )?.[1];
      const visibleTitle = cleanHtmlText(
        block.match(
          /<div[^>]*class=["']title["'][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i,
        )?.[1] ?? '',
      );
      const title = cleanHtmlText(titleAttribute ?? '') || visibleTitle;
      if (!title) return null;

      const castText = cleanHtmlText(
        block.match(
          /class=["']subject-cast["'][^>]*>([\s\S]*?)<\/span>/i,
        )?.[1] ?? '',
      );
      const originalTitle = castText.match(
        /(?:原名|原题)\s*[:：]\s*([^/]+)/,
      )?.[1]
        ? cleanHtmlText(
            castText.match(/(?:原名|原题)\s*[:：]\s*([^/]+)/)?.[1] ?? '',
          )
        : '';
      const subtitle =
        visibleTitle &&
        normalizeDoubanText(visibleTitle) !== normalizeDoubanText(title)
          ? visibleTitle
          : originalTitle &&
              normalizeDoubanText(originalTitle) !== normalizeDoubanText(title)
            ? originalTitle
            : undefined;
      const score = Number(
        block.match(/class=["']rating_nums["'][^>]*>\s*([\d.]+)/i)?.[1],
      );
      const votes = Number(
        block.match(/\(([\d,]+)\s*人评价\)/)?.[1]?.replaceAll(',', ''),
      );
      const year = castText.match(/\b(?:18|19|20)\d{2}\b/)?.[0];
      const isSeries = /\[电视剧\]/.test(block);

      return {
        id,
        title,
        subtitle,
        year,
        episode: isSeries ? '1' : undefined,
        score: Number.isFinite(score) && score > 0 ? score : undefined,
        votes: Number.isFinite(votes) && votes > 0 ? votes : undefined,
      } satisfies DoubanSuggestion;
    })
    .filter((item): item is DoubanSuggestion => item !== null);
}

function cleanHtmlText(value: string) {
  return decodeHtmlEntities(
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

export function parseDoubanRating(
  response: ZduoRatingResponse,
  suggestion: DoubanSuggestion,
): DoubanRating | null {
  if (String(response.code) !== '1') {
    return createDoubanRatingSnapshot(suggestion);
  }

  const score =
    readLatestValue(response.data?.day_rate) ?? suggestion.score ?? null;
  if (score === null || score <= 0) return null;

  return createRating(suggestion, score);
}

export function createDoubanRatingSnapshot(suggestion: DoubanSuggestion) {
  if (!suggestion.score || suggestion.score <= 0) return null;
  return createRating(suggestion, suggestion.score);
}

function createRating(suggestion: DoubanSuggestion, score: number) {
  return {
    subjectId: suggestion.id,
    subjectTitle: suggestion.title,
    subjectYear: suggestion.year,
    sourceUrl: `https://movie.douban.com/subject/${encodeURIComponent(suggestion.id)}/`,
    score,
    votes: suggestion.votes,
  } satisfies DoubanRating;
}

function readLatestValue(chart: ZduoChart | undefined) {
  const values = chart?.series?.[0]?.data;
  if (!Array.isArray(values)) return null;

  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = Number(values[index]);
    if (Number.isFinite(value) && value > 0) return value;
  }

  return null;
}
