import { describe, expect, it } from 'vitest';
import type { Movie } from './data';
import { movieSearchScore, rankMovies } from './search-ranking';

function movie(overrides: Partial<Movie> = {}): Movie {
  return {
    backdrop_path: null,
    genre_ids: [],
    id: 1,
    original_language: 'en',
    original_title: 'Example',
    overview: '',
    popularity: 1,
    poster_path: null,
    release_date: '2025-01-01',
    title: 'Example',
    video: false,
    vote_average: 7,
    vote_count: 500,
    ...overrides,
  };
}

describe('movie search ranking', () => {
  it('does not mutate the source rating', () => {
    const source = movie({ vote_average: 8, vote_count: 10 });
    movieSearchScore(source, 'Example');
    movieSearchScore(source, 'Example');
    expect(source.vote_average).toBe(8);
  });

  it('gives exact title matches a bonus', () => {
    const source = movie();
    expect(movieSearchScore(source, 'example')).toBeGreaterThan(
      movieSearchScore(source, 'different'),
    );
  });

  it('ranks stronger results and filters very weak results', () => {
    const strong = movie({ id: 1, vote_average: 8, vote_count: 1000 });
    const weak = movie({ id: 2, vote_average: 1, vote_count: 1 });
    expect(rankMovies([weak, strong], 'query')).toEqual([strong]);
  });
});
