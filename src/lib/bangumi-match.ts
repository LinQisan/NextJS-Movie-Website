export type BangumiMatchQuery = {
  title: string;
  originalTitle?: string;
  titles?: string[];
  year?: string;
  media: 'movie' | 'tv';
};

export type BangumiMatchCandidate = {
  id: number;
  type: number;
  name?: string;
  name_cn?: string;
  date?: string;
  platform?: string;
  rating?: { total?: number } | null;
};

export function normalizeBangumiTitle(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, '');
}

export function scoreBangumiCandidate(
  candidate: Pick<
    BangumiMatchCandidate,
    'name' | 'name_cn' | 'date' | 'platform'
  >,
  query: Pick<
    BangumiMatchQuery,
    'title' | 'originalTitle' | 'titles' | 'year' | 'media'
  >,
) {
  const candidateNames = uniqueStrings([candidate.name, candidate.name_cn]).map(
    normalizeBangumiTitle,
  );
  const queryNames = uniqueStrings([
    query.originalTitle,
    query.title,
    ...(query.titles ?? []),
  ]).map(normalizeBangumiTitle);

  const titleScore = queryNames.reduce((best, queryName) => {
    if (!queryName) return best;
    return Math.max(
      best,
      candidateNames.some((name) => name === queryName)
        ? 1
        : candidateNames.some(
              (name) =>
                name.length > 3 &&
                (name.includes(queryName) || queryName.includes(name)),
            )
          ? 0.72
          : 0,
    );
  }, 0);

  if (titleScore === 0) return 0;

  let score = titleScore;
  const queryYear = parseYear(query.year);
  const candidateYear = parseYear(candidate.date);
  if (queryYear && candidateYear) {
    const difference = Math.abs(queryYear - candidateYear);
    if (difference === 0) score += 0.2;
    else if (difference === 1) score += 0.1;
    else if (difference > 2) score -= 0.08;
  }

  const platform = candidate.platform?.toLocaleLowerCase() ?? '';
  if (query.media === 'movie' && /(movie|film|映画|剧场)/u.test(platform)) {
    score += 0.08;
  }
  if (query.media === 'tv' && /(tv|web|ova|番|电视)/u.test(platform)) {
    score += 0.08;
  }

  return score;
}

export function chooseBangumiCandidate<T extends BangumiMatchCandidate>(
  candidates: T[],
  query: BangumiMatchQuery,
) {
  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: scoreBangumiCandidate(candidate, query),
    }))
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return (first.candidate.rating?.total ?? 0) >
        (second.candidate.rating?.total ?? 0)
        ? -1
        : 1;
    });

  const best = ranked[0];
  return best && best.score >= 0.72 ? best.candidate : null;
}

function uniqueStrings(values: (string | undefined | null)[]) {
  return [
    ...new Set(values.map((value) => value?.trim()).filter(Boolean)),
  ] as string[];
}

function parseYear(value?: string) {
  const year = Number(value?.slice(0, 4));
  return Number.isInteger(year) && year >= 1900 ? year : null;
}
