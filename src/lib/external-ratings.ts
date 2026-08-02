import type { BangumiAnimeInfo } from './bangumi-types';

export type ExternalRating = {
  source: string;
  score: number;
  scale: 10 | 100;
  votes?: number;
  href: string;
};

export type NextEpisode = {
  name: string;
  season: number;
  number: number;
  airdate: string;
};

export type TVMazeInfo = {
  name: string;
  href: string;
  rating?: number;
  status?: string;
  network?: string;
  schedule?: {
    days: string[];
    time: string;
  };
  nextEpisode?: NextEpisode;
};

export type ExternalRatingsResponse = {
  ratings: ExternalRating[];
  tvmaze: TVMazeInfo | null;
  bangumi: BangumiAnimeInfo | null;
};
