export type RatingScale = 10 | 100;

export type RatingInput = {
  source: string;
  score: number;
  scale: RatingScale;
  votes?: number;
  href: string;
};

export type RatingGroup = 'imdb' | 'douban' | 'tmdb' | 'other';

export type WeightedRating = RatingInput & {
  group: RatingGroup;
  normalizedScore: number;
  voteFactor: number;
  effectiveWeight: number;
};

export type WeightedRatingResult = {
  score: number;
  contributors: WeightedRating[];
};

const GROUP_WEIGHTS: Record<RatingGroup, number> = {
  imdb: 0.5,
  douban: 0.3,
  tmdb: 0.14,
  other: 0.06,
};

/**
 * Combine ratings on a 10-point scale. Source priority is explicit while
 * vote counts adjust confidence logarithmically, so a single very popular
 * source cannot completely drown out the others.
 */
export function calculateWeightedRating(
  ratings: RatingInput[],
): WeightedRatingResult | null {
  const contributors = ratings
    .map((rating) => createWeightedRating(rating))
    .filter((rating): rating is WeightedRating => rating !== null)
    .sort(
      (first, second) => groupOrder(first.group) - groupOrder(second.group),
    );

  const totalWeight = contributors.reduce(
    (total, rating) => total + rating.effectiveWeight,
    0,
  );
  if (totalWeight <= 0) return null;

  const weightedScore = contributors.reduce(
    (total, rating) => total + rating.normalizedScore * rating.effectiveWeight,
    0,
  );

  return {
    score: weightedScore / totalWeight,
    contributors,
  };
}

export function getRatingGroup(source: string): RatingGroup {
  const normalized = source.toLocaleLowerCase();
  if (normalized.includes('imdb')) return 'imdb';
  if (normalized.includes('douban') || normalized.includes('豆瓣')) {
    return 'douban';
  }
  if (normalized.includes('tmdb')) return 'tmdb';
  return 'other';
}

function createWeightedRating(rating: RatingInput): WeightedRating | null {
  const normalizedScore = normalizeScore(rating.score, rating.scale);
  if (normalizedScore === null) return null;

  const group = getRatingGroup(rating.source);
  const voteFactor = getVoteFactor(rating.votes);

  return {
    ...rating,
    group,
    normalizedScore,
    voteFactor,
    effectiveWeight: GROUP_WEIGHTS[group] * voteFactor,
  };
}

function normalizeScore(score: number, scale: RatingScale) {
  const value = Number(score);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.min(10, (value / scale) * 10);
}

/**
 * Vote confidence grows with log10(votes), from 0.5 without a vote count to
 * 1.0 at roughly one million votes. This keeps vote volume meaningful while
 * preventing IMDb's much larger audience from becoming the only signal.
 */
function getVoteFactor(votes?: number) {
  const count = Number(votes);
  if (!Number.isFinite(count) || count <= 0) return 0.5;
  return 0.5 + 0.5 * Math.min(1, Math.log10(count + 1) / 6);
}

function groupOrder(group: RatingGroup) {
  return { imdb: 0, douban: 1, tmdb: 2, other: 3 }[group];
}
