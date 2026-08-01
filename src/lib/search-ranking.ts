import type { Movie } from './data';

export function movieSearchScore(movie: Movie, query: string) {
  const votePenalty = movie.vote_count < 100 ? 3 : 0;
  const parsedReleaseDate = Date.parse(movie.release_date);
  const releaseYear = Number.isNaN(parsedReleaseDate)
    ? 0
    : new Date(parsedReleaseDate).getFullYear();
  const recency = releaseYear ? (releaseYear - 2000) * 0.02 : 0;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const exactTitleBonus = [movie.title, movie.original_title].some(
    (title) => title.toLocaleLowerCase() === normalizedQuery,
  )
    ? 1
    : 0;

  return movie.vote_average - votePenalty + recency + exactTitleBonus;
}

export function rankMovies(movies: Movie[], query: string) {
  return movies
    .map((movie) => ({ movie, score: movieSearchScore(movie, query) }))
    .filter(({ score }) => score > 2)
    .sort((a, b) => b.score - a.score)
    .map(({ movie }) => movie);
}
