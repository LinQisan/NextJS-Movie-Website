'use server';
import { yearDiff } from './util';

export interface Movie {
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
}

export interface TV {
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
}

export type Media = Movie | TV;

interface Recents {
  id: number;
  title: string;
  media_type: string;
  release_date?: string;
}
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_Bearer}`,
  },
};

export async function fetchTrendingMovie() {
  try {
    const res = await fetch(
      'https://api.themoviedb.org/3/trending/movie/week?language=zh-CN',
      options,
    );
    const { results: data } = await res.json();

    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function fetchTrendingTV() {
  try {
    const res = await fetch(
      'https://api.themoviedb.org/3/trending/tv/week?language=zh-CN',
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
      console.error('Database Error:', error);
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

export async function fetchMovieDetails(id: string) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?append_to_response=release_dates%2Ccredits&language=zh-CN`,
      options,
    );
    const data = await res.json();

    return data;
  } catch (err) {
    console.error(err);
  }
}
export async function fetchTVSeasonDetails(
  seriesId: number,
  seasonNumber: string,
) {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?language=zh-CN`,
      options,
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

export async function fetchTVDetails(id: string) {
  try {
    const detailsRes = await fetch(
      `https://api.themoviedb.org/3/tv/${id}?append_to_response=content_ratings,aggregate_credits&language=zh-CN`,
      options,
    );
    const tvDetails = await detailsRes.json();
    const seasonPromises = tvDetails.seasons.map(async (season: any) => {
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

    const seasonData = await Promise.all(seasonPromises);

    return {
      ...tvDetails,
      seasonData,
    };
  } catch (err) {
    console.error(err);
  }
}

export async function fetchRecent() {
  try {
    const res = await fetch(
      'https://api.themoviedb.org/3/trending/all/day?language=zh-CN',
      options,
    );
    const { results } = await res.json();
    const movie = results.filter((res: Recents) => res.media_type === 'movie');
    const tv = results.filter((res: Recents) => res.media_type === 'tv');
    return { movie, tv };
  } catch (err) {
    console.error(err);
    return { movie: [], tv: [] };
  }
}
