'use server';
import { yearDiff } from './utils';

export type Movie = {
  adult: Boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: false;
  vote_average: number;
  vote_count: number;
};

export type TV = {
  adult: Boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
};

export type tvDetail = {
  backdrop_path?: string;
  first_air_date: string;
  genres: {
    id: number;
    name: string;
  }[];
  id: number;
  name: string;
  original_name: string;
  tagline?: string;
  content_ratings: {
    results?: {
      iso_3166_1: string;
      rating: string;
    }[];
  };
  vote_average: number;
  overview: string;
  production_companies: {
    id: number;
    name: string;
  }[];
  seasons: season[];
};

export type MovieDetail = {
  backdrop_path?: string;
  release_date: string;
  genres: {
    id: number;
    name: string;
  }[];
  id: number;
  title: string;
  runtime: number;
  original_title: string;
  tagline?: string;
  release_dates: {
    results?: {
      iso_3166_1: string;
      release_dates: {
        certification: string;
      }[];
    }[];
  };

  vote_average: number;
  overview: string;
  production_companies: {
    id: number;
    name: string;
  }[];
  revenue?: number;
  budget?: number;
  credits: MovieCredits;
};

export type season = {
  episode_count: number;
  id: number;
  season_number: number;
};

export type TVCredits = {
  cast: {
    id: number;
    name: string;
    profile_path?: string;
    known_for_department: string;
    roles: { character: string }[];
  }[];
  crew: {
    id: number;
    name: string;
    profile_path?: string;
    jobs: {
      credit_id: string;
      job: string;
    }[];
  }[];
};

export type MovieCredits = {
  cast: {
    id: number;
    name: string;
    profile_path?: string;
    known_for_department: string;
    character: string;
  }[];
  crew: {
    id: number;
    name: string;
    profile_path?: string;
    job: string;
  }[];
};

export type Media = Movie | TV;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_Bearer}`,
  },
};

export async function getTrending(media: 'movie' | 'tv') {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/trending/${media}/week?language=zh-CN`,
      options,
    );
    const { results: data } = await res.json();

    return data;
  } catch (err) {
    console.error(err);
  }
}

// Search Function
export async function fetchMoviesName(key: string) {
  let page = 1;
  const maxPages = 3;
  let allData: Movie[] = [];
  while (page <= maxPages) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${key}&include_adult=false&page=${page}&language=zh-CN`,
        options,
      );
      const movies = await res.json();
      if (!movies.results || movies.results.length === 0) {
        break;
      }
      allData = allData.concat(movies.results);
      page++;
      return allData;
    } catch (error) {
      throw new Error('Failed to fetch movies.');
    }
  }

  // 根据评分、上映时间、terms进行搜索结果的排序
  // 关于与terms的相关性可以进一步用一个函数去判断相关性 区分简繁体，返回相似度
  const calcSortScore = (movie: Movie) => {
    if (movie.vote_count < 100) {
      movie.vote_average -= 3;
    }
    const nameRelate = movie.original_title === decodeURIComponent(key) ? 1 : 0;
    return (
      movie.vote_average + yearDiff(movie.release_date) * 0.01 + nameRelate
    );
  };

  const data = allData
    .sort((a: Movie, b: Movie) => {
      return calcSortScore(b) - calcSortScore(a);
    })
    .filter((movie: Movie) => calcSortScore(movie) > 2);

  return data;
}

export async function fetchTVName(key: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${key}&include_adult=false&page=1&language=zh-CN`,
      options,
    );
    const { results: data } = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function getMovieDetails(id: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?append_to_response=release_dates%2Ccredits&language=zh-CN`,
      options,
    );
    const data: MovieDetail = await res.json();

    return data;
  } catch (err) {
    throw new Error('Failed to fetch Movie Detail data');
  }
}

export async function getSeasonDetails(id: string, seasons: season[]) {
  const seasonPromises = seasons.map(async (season: season) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${season.season_number}?language=zh-CN`,
        options,
      );
      return await response.json();
    } catch (err) {
      console.error(`Error fetching season ${season.season_number}:`, err);
      return null;
    }
  });
  const data = await Promise.all(seasonPromises);
  return data;
}

export async function fetchTVDetails(id: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?append_to_response=content_ratings&language=zh-CN`,
      options,
    );
    const data: tvDetail = await res.json();

    return data;
  } catch (err) {
    throw new Error('Failed to fetch tv Detail data');
  }
}

export async function getTVCredits(id: string) {
  try {
    const detailsRes = await fetch(
      `https://api.themoviedb.org/3/tv/${id}/aggregate_credits?language=zh-CN`,
      options,
    );
    const data: TVCredits = await detailsRes.json();

    return data;
  } catch (err) {
    throw new Error('Failed to fetch credits data');
  }
}
