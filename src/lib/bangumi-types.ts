export type BangumiCharacterActor = {
  id: number;
  name: string;
  image?: string;
};

export type BangumiCharacter = {
  id: number;
  name: string;
  relation?: string;
  image?: string;
  actors: BangumiCharacterActor[];
  /** Supports responses cached before the multi-actor shape was introduced. */
  actor?: BangumiCharacterActor;
};

export type BangumiAnimeInfo = {
  id: number;
  name: string;
  nameCn?: string;
  summary?: string;
  date?: string;
  platform?: string;
  episodes?: number;
  totalEpisodes?: number;
  score?: number;
  scoreVotes?: number;
  rank?: number;
  collection?: number;
  tags: string[];
  image?: string;
  characters: BangumiCharacter[];
  href: string;
};
