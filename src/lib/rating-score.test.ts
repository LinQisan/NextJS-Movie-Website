import { describe, expect, it } from 'vitest';

import { calculateWeightedRating, getRatingGroup } from './rating-score';

const rating = (source: string, score: number, votes?: number) => ({
  source,
  score,
  scale: 10 as const,
  votes,
  href: '#',
});

describe('rating score', () => {
  it('classifies sources by the requested priority', () => {
    expect(getRatingGroup('IMDb')).toBe('imdb');
    expect(getRatingGroup('Douban')).toBe('douban');
    expect(getRatingGroup('TMDB')).toBe('tmdb');
    expect(getRatingGroup('TVmaze')).toBe('other');
  });

  it('gives IMDb more influence than Douban, TMDB, and other sources', () => {
    const result = calculateWeightedRating([
      rating('IMDb', 9, 1_000_000),
      rating('Douban', 5, 1_000_000),
      rating('TMDB', 5, 1_000_000),
      rating('TVmaze', 5, 1_000_000),
    ]);

    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThan(6.9);
    expect(result!.contributors.map((item) => item.group)).toEqual([
      'imdb',
      'douban',
      'tmdb',
      'other',
    ]);
  });

  it('uses vote volume as a confidence adjustment', () => {
    const manyVotes = calculateWeightedRating([rating('IMDb', 9, 1_000_000)])!;
    const fewVotes = calculateWeightedRating([rating('IMDb', 9, 10)])!;

    expect(manyVotes.contributors[0].voteFactor).toBeGreaterThan(
      fewVotes.contributors[0].voteFactor,
    );
    expect(manyVotes.score).toBe(9);
    expect(fewVotes.score).toBe(9);
  });
});
