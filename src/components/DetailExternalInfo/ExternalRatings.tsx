'use client';

import { useEffect, useState, type ReactNode } from 'react';

import { I18nText, useI18n } from '@/components/I18nProvider';
import type { BangumiAnimeInfo } from '@/lib/bangumi-types';
import { localeConfig, type Locale } from '@/lib/i18n';
import type { DoubanRatingResponse } from '@/lib/douban-trend';
import {
  calculateWeightedRating,
  type RatingInput,
  type WeightedRating,
  type WeightedRatingResult,
} from '@/lib/rating-score';
import type {
  ExternalRating,
  ExternalRatingsResponse,
  TVMazeInfo,
} from '@/lib/external-ratings';
import RatingChart from './RatingChart';

type DoubanCacheEntry = {
  rating: DoubanRatingResponse['rating'];
  expiresAt: number;
};

type ExternalCacheEntry = {
  data: ExternalRatingsResponse | null;
  expiresAt: number;
};

const doubanCache = new Map<string, DoubanCacheEntry>();
const pendingDoubanRequests = new Map<
  string,
  Promise<DoubanRatingResponse['rating']>
>();
const externalCache = new Map<string, ExternalCacheEntry>();
const pendingExternalRequests = new Map<
  string,
  Promise<ExternalRatingsResponse | null>
>();
const MAX_DOUBAN_CACHE_ENTRIES = 64;
const MAX_EXTERNAL_CACHE_ENTRIES = 64;
const DOUBAN_FAILURE_CACHE_MS = 30_000;
const EXTERNAL_FAILURE_CACHE_MS = 30_000;

const DAY_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
  },
  ja: {
    Monday: '月',
    Tuesday: '火',
    Wednesday: '水',
    Thursday: '木',
    Friday: '金',
    Saturday: '土',
    Sunday: '日',
  },
  zh: {
    Monday: '周一',
    Tuesday: '周二',
    Wednesday: '周三',
    Thursday: '周四',
    Friday: '周五',
    Saturday: '周六',
    Sunday: '周日',
  },
};

export type ExternalRatingsProps = {
  imdbId?: string | null;
  tmdbId: number | string;
  tmdbScore: number;
  tmdbVotes?: number;
  title: string;
  originalTitle?: string;
  titles?: string[];
  year?: string;
  doubanKey: string;
  media: 'movie' | 'tv';
  isAnimation?: boolean;
  /** Server-resolved Bangumi data prevents a duplicate client-side lookup. */
  bangumi?: BangumiAnimeInfo | null;
};

type ExternalRatingState = {
  ratings: RatingInput[];
  weighted: WeightedRatingResult | null;
  broadcast: TVMazeInfo | null;
  bangumi: BangumiAnimeInfo | null;
};

export function useExternalRatings({
  imdbId,
  tmdbId,
  tmdbScore,
  tmdbVotes,
  title,
  originalTitle,
  titles,
  year,
  doubanKey,
  media,
  isAnimation = false,
  bangumi: initialBangumi = null,
}: ExternalRatingsProps): ExternalRatingState {
  const [externalData, setExternalData] =
    useState<ExternalRatingsResponse | null>(null);
  const [externalLoadedKey, setExternalLoadedKey] = useState<string | null>(
    null,
  );
  const [doubanData, setDoubanData] =
    useState<DoubanRatingResponse['rating']>(null);
  const [doubanLoadedKey, setDoubanLoadedKey] = useState<string | null>(null);

  const shouldResolveBangumi = isAnimation && !initialBangumi;
  const externalRequestKey = `${media}:${tmdbId}:${shouldResolveBangumi ? 'animation' : 'base'}`;

  useEffect(() => {
    if ((!imdbId && !isAnimation) || !title || title.length < 2) return;

    let disposed = false;
    fetchCachedExternalRatings(externalRequestKey, {
      imdbId,
      media,
      title,
      originalTitle,
      titles,
      year,
      isAnimation: shouldResolveBangumi,
    }).then((nextData) => {
      if (disposed) return;
      setExternalData(nextData);
      setExternalLoadedKey(externalRequestKey);
    });

    return () => {
      disposed = true;
    };
  }, [
    externalRequestKey,
    imdbId,
    isAnimation,
    media,
    originalTitle,
    shouldResolveBangumi,
    title,
    titles,
    year,
    initialBangumi,
  ]);

  useEffect(() => {
    if (!title || title.length < 2 || !doubanKey) return;

    let disposed = false;
    // The key is based on the stable TMDB identity, not the localized title.
    // Language changes can rerun this effect, but the module cache prevents a
    // second network request for the same title.
    fetchCachedDoubanRating(doubanKey, {
      title,
      originalTitle,
      titles,
      year,
      media,
    }).then((data) => {
      if (disposed) return;
      setDoubanData(data);
      setDoubanLoadedKey(doubanKey);
    });

    return () => {
      disposed = true;
    };
  }, [doubanKey, media, originalTitle, title, titles, year]);

  const visibleExternalData =
    externalLoadedKey === externalRequestKey ? externalData : null;
  const visibleDoubanData = doubanLoadedKey === doubanKey ? doubanData : null;
  const visibleBangumi = visibleExternalData?.bangumi ?? initialBangumi;
  const ratings = createRatings({
    tmdbId,
    tmdbScore,
    tmdbVotes,
    media,
    doubanData: visibleDoubanData,
    externalData: visibleExternalData,
    bangumiData: visibleBangumi,
  });
  const weighted = calculateWeightedRating(ratings);
  const broadcast = media === 'tv' ? visibleExternalData?.tvmaze ?? null : null;
  const bangumi = visibleBangumi;

  return { ratings, weighted, broadcast, bangumi };
}

export default function ExternalRatings(props: ExternalRatingsProps) {
  const { locale } = useI18n();
  const { ratings, weighted, broadcast, bangumi } = useExternalRatings(props);

  if (ratings.length === 0 && !broadcast && !bangumi) return null;

  return (
    <div className='space-y-10'>
      {ratings.length > 0 && (
        <section className='border-b border-zinc-200/80 pb-8'>
          <div className='flex items-end justify-between gap-4'>
            <div>
              <SectionEyebrow>
                <I18nText messageKey='detail.combinedRating' />
              </SectionEyebrow>
              {weighted && (
                <p className='mt-2 text-6xl font-semibold leading-none tracking-[-0.06em] text-[var(--theme-accent)]'>
                  {weighted.score.toFixed(1)}
                  <span className='ml-1 text-xs font-medium tracking-normal text-zinc-400'>
                    /10
                  </span>
                </p>
              )}
            </div>
            <span className='pb-1 text-right text-[10px] font-medium uppercase leading-4 tracking-[0.12em] text-zinc-400'>
              <I18nText messageKey='detail.weightedRating' />
              <br />
              <I18nText messageKey='detail.votesInfluence' />
            </span>
          </div>

          <RatingChart ratings={weighted?.contributors ?? []} locale={locale} />
        </section>
      )}

      {broadcast && <BroadcastSection data={broadcast} locale={locale} />}

      {bangumi && <BangumiSection data={bangumi} locale={locale} />}
    </div>
  );
}

function createRatings({
  tmdbId,
  tmdbScore,
  tmdbVotes,
  media,
  doubanData,
  externalData,
  bangumiData,
}: {
  tmdbId: number | string;
  tmdbScore: number;
  tmdbVotes?: number;
  media: 'movie' | 'tv';
  doubanData: DoubanRatingResponse['rating'];
  externalData: ExternalRatingsResponse | null;
  bangumiData: BangumiAnimeInfo | null;
}) {
  const ratings: RatingInput[] = [];
  if (Number.isFinite(tmdbScore) && tmdbScore > 0) {
    ratings.push({
      source: 'TMDB',
      score: tmdbScore,
      scale: 10,
      votes: tmdbVotes,
      href: `https://www.themoviedb.org/${media}/${tmdbId}`,
    });
  }

  if (doubanData?.score) {
    ratings.push({
      source: 'Douban',
      score: doubanData.score,
      scale: 10,
      votes: doubanData.votes,
      href: doubanData.sourceUrl,
    });
  }

  if (externalData) {
    ratings.push(...externalData.ratings);
    if (media === 'tv' && externalData.tvmaze?.rating) {
      ratings.push({
        source: 'TVmaze',
        score: externalData.tvmaze.rating,
        scale: 10,
        href: externalData.tvmaze.href,
      });
    }
  }

  if (bangumiData?.score) {
    ratings.push({
      source: 'Bangumi',
      score: bangumiData.score,
      scale: 10,
      votes: bangumiData.scoreVotes,
      href: bangumiData.href,
    });
  }

  return ratings;
}

function fetchCachedExternalRatings(
  cacheKey: string,
  query: {
    imdbId?: string | null;
    media: ExternalRatingsProps['media'];
    title: string;
    originalTitle?: string;
    titles?: string[];
    year?: string;
    isAnimation: boolean;
  },
) {
  const cached = externalCache.get(cacheKey);
  if (cached) {
    if (cached.data || cached.expiresAt > Date.now()) {
      return Promise.resolve(cached.data);
    }
    externalCache.delete(cacheKey);
  }

  const pending = pendingExternalRequests.get(cacheKey);
  if (pending) return pending;

  const params = new URLSearchParams({
    media: query.media,
    title: query.title,
  });
  if (query.imdbId) params.set('imdb', query.imdbId);
  if (query.originalTitle) params.set('originalTitle', query.originalTitle);
  if (query.titles?.length) params.set('titles', JSON.stringify(query.titles));
  if (query.year) params.set('year', query.year.slice(0, 4));
  if (query.isAnimation) params.set('animation', '1');

  const request = fetch(`/api/external-ratings?${params.toString()}`)
    .then(async (response) => {
      if (!response.ok) throw new Error('External ratings request failed.');
      return (await response.json()) as ExternalRatingsResponse;
    })
    .catch(() => null)
    .then((data) => {
      if (externalCache.size >= MAX_EXTERNAL_CACHE_ENTRIES) {
        const oldestKey = externalCache.keys().next().value;
        if (oldestKey) externalCache.delete(oldestKey);
      }
      externalCache.set(cacheKey, {
        data,
        expiresAt: data
          ? Number.POSITIVE_INFINITY
          : Date.now() + EXTERNAL_FAILURE_CACHE_MS,
      });
      pendingExternalRequests.delete(cacheKey);
      return data;
    });

  pendingExternalRequests.set(cacheKey, request);
  return request;
}

function fetchCachedDoubanRating(
  cacheKey: string,
  query: {
    title: string;
    originalTitle?: string;
    titles?: string[];
    year?: string;
    media: ExternalRatingsProps['media'];
  },
) {
  const cached = doubanCache.get(cacheKey);
  if (cached) {
    if (cached.rating || cached.expiresAt > Date.now()) {
      return Promise.resolve(cached.rating);
    }
    doubanCache.delete(cacheKey);
  }

  const pending = pendingDoubanRequests.get(cacheKey);
  if (pending) return pending;

  const params = new URLSearchParams({
    title: query.title,
    media: query.media,
  });
  if (query.originalTitle) params.set('originalTitle', query.originalTitle);
  if (query.titles?.length) params.set('titles', JSON.stringify(query.titles));
  if (query.year) params.set('year', query.year.slice(0, 4));

  const request = fetch(`/api/douban-trend?${params.toString()}`)
    .then(async (response) => {
      if (!response.ok) throw new Error('Douban rating request failed.');
      return (await response.json()) as DoubanRatingResponse;
    })
    .then((response) => response.rating)
    .catch(() => null)
    .then((rating) => {
      if (doubanCache.size >= MAX_DOUBAN_CACHE_ENTRIES) {
        const oldestKey = doubanCache.keys().next().value;
        if (oldestKey) doubanCache.delete(oldestKey);
      }
      doubanCache.set(cacheKey, {
        rating,
        // Successful subject matches are stable across locale changes. A
        // null result is only held briefly so a transient Douban rate limit
        // does not make the score disappear for the whole browser session.
        expiresAt: rating
          ? Number.POSITIVE_INFINITY
          : Date.now() + DOUBAN_FAILURE_CACHE_MS,
      });
      pendingDoubanRequests.delete(cacheKey);
      return rating;
    });

  pendingDoubanRequests.set(cacheKey, request);
  return request;
}

function BroadcastSection({
  data,
  locale,
}: {
  data: TVMazeInfo;
  locale: Locale;
}) {
  const schedule = data.schedule
    ? [
        data.schedule.days
          .map((day) => DAY_LABELS[locale][day] || day)
          .join(' · '),
        data.schedule.time,
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  return (
    <section className='border-b border-zinc-200/80 pb-8'>
      <div className='flex items-baseline justify-between gap-3'>
        <SectionEyebrow>
          <I18nText messageKey='detail.broadcast' />
        </SectionEyebrow>
        <a
          href={data.href}
          target='_blank'
          rel='noreferrer'
          className='text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:text-[var(--theme-accent)]'
        >
          TVmaze ↗
        </a>
      </div>

      <dl className='mt-4 grid grid-cols-2 gap-x-5 gap-y-4'>
        {data.status && (
          <InfoRow
            label={<I18nText messageKey='detail.status' />}
            value={data.status}
          />
        )}
        {data.network && (
          <InfoRow
            label={<I18nText messageKey='detail.network' />}
            value={data.network}
          />
        )}
        {schedule && (
          <InfoRow
            label={<I18nText messageKey='detail.schedule' />}
            value={schedule}
          />
        )}
        {data.nextEpisode && (
          <InfoRow
            className='col-span-2'
            label={<I18nText messageKey='detail.nextEpisode' />}
            value={formatEpisode(data.nextEpisode, locale)}
          />
        )}
      </dl>
    </section>
  );
}

function BangumiSection({
  data,
  locale,
}: {
  data: BangumiAnimeInfo;
  locale: Locale;
}) {
  const displayName = locale === 'zh' ? data.nameCn || data.name : data.name;
  const episodeCount = data.totalEpisodes || data.episodes;

  return (
    <section className='border-b border-zinc-200/80 pb-8'>
      <div className='flex items-baseline justify-between gap-3'>
        <SectionEyebrow>
          <I18nText messageKey='detail.bangumi' />
        </SectionEyebrow>
        <a
          href={data.href}
          target='_blank'
          rel='noreferrer'
          className='text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 transition-colors hover:text-[var(--theme-accent)]'
        >
          Bangumi ↗
        </a>
      </div>

      <p className='mt-3 text-sm font-medium leading-6 text-zinc-800'>
        {displayName}
      </p>

      <dl className='mt-4 grid grid-cols-2 gap-x-5 gap-y-4'>
        {data.date && (
          <InfoRow
            label={<I18nText messageKey='detail.bangumiDate' />}
            value={formatDate(data.date, locale)}
          />
        )}
        {data.platform && (
          <InfoRow
            label={<I18nText messageKey='detail.bangumiPlatform' />}
            value={data.platform}
          />
        )}
        {episodeCount && (
          <InfoRow
            label={<I18nText messageKey='detail.bangumiEpisodes' />}
            value={String(episodeCount)}
          />
        )}
        {data.rank && (
          <InfoRow
            label={<I18nText messageKey='detail.bangumiRank' />}
            value={`#${data.rank}`}
          />
        )}
        {data.collection && (
          <InfoRow
            label={<I18nText messageKey='detail.bangumiCollection' />}
            value={formatCount(data.collection, locale)}
          />
        )}
      </dl>

      {data.tags.length > 0 && (
        <div className='mt-4'>
          <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400'>
            <I18nText messageKey='detail.bangumiTags' />
          </p>
          <p className='mt-2 text-xs leading-5 text-zinc-600'>
            {data.tags.join(' / ')}
          </p>
        </div>
      )}
    </section>
  );
}

function InfoRow({
  label,
  value,
  className = '',
}: {
  label: ReactNode;
  value: string;
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className='text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400'>
        {label}
      </dt>
      <dd className='mt-1 truncate text-sm font-medium text-zinc-800'>
        {value}
      </dd>
    </div>
  );
}

function formatEpisode(
  episode: NonNullable<TVMazeInfo['nextEpisode']>,
  locale: Locale,
) {
  const date = new Date(`${episode.airdate}T00:00:00`);
  const formattedDate = Number.isNaN(date.getTime())
    ? episode.airdate
    : new Intl.DateTimeFormat(localeConfig[locale].html, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);

  return `S${episode.season} E${episode.number} · ${episode.name} · ${formattedDate}`;
}

function formatCount(value: number, locale: Locale) {
  return new Intl.NumberFormat(localeConfig[locale].html, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDate(value: string, locale: Locale) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(localeConfig[locale].html, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400'>
      {children}
    </h2>
  );
}
