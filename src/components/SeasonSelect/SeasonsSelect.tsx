'use client';

import type { Episode, Season } from '@/lib/data';
import React from 'react';

import { I18nText } from '../I18nProvider';

export default function SeasonsSelect({
  id,
  seasons,
}: {
  id: string;
  seasons: Season[];
}) {
  const initialSeason =
    seasons.find((season) => season.season_number === 1) ?? seasons[0];
  const [selectedSeason, setSelectedSeason] = React.useState(
    String(initialSeason?.season_number ?? 0),
  );
  const [selectedEpisode, setSelectedEpisode] = React.useState('1');
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  React.useEffect(() => {
    const controller = new AbortController();

    async function fetchEpisodes() {
      try {
        const response = await fetch(`/api/${id}?season=${selectedSeason}`, {
          signal: controller.signal,
        });
        const json = (await response.json()) as {
          data?: { episodes?: Episode[] };
          error?: string;
        };
        if (!response.ok)
          throw new Error(json.error || 'Unable to load episodes.');
        setEpisodes(json.data?.episodes ?? []);
        setStatus('ready');
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setEpisodes([]);
        setStatus('error');
      }
    }

    void fetchEpisodes();
    return () => controller.abort();
  }, [selectedSeason, id]);

  const episode = episodes.find(
    (item) => item.episode_number === Number(selectedEpisode),
  );

  return (
    <section
      className='border-t border-zinc-200/80 pt-8'
      aria-labelledby='episode-info-heading'
    >
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2.5'>
            <span
              className='h-4 w-1 rounded-full bg-slate-400'
              aria-hidden='true'
            />
            <h2
              id='episode-info-heading'
              className='text-lg font-semibold tracking-[-0.02em] text-zinc-950'
            >
              <I18nText messageKey='detail.episodeInfo' />
            </h2>
          </div>
          {initialSeason && (
            <p className='mt-2 text-xs text-zinc-500'>
              {seasons.length} <I18nText messageKey='detail.seasons' />
            </p>
          )}
        </div>

        {initialSeason && (
          <div className='flex w-full flex-wrap gap-2 sm:w-auto'>
            <label className='sr-only' htmlFor='tv-season'>
              <I18nText messageKey='detail.selectSeason' />
            </label>
            <select
              id='tv-season'
              value={selectedSeason}
              onChange={(event) => {
                setSelectedSeason(event.target.value);
                setSelectedEpisode('1');
                setStatus('loading');
              }}
              className='h-9 min-w-36 flex-1 rounded-none border-0 border-b border-zinc-300 bg-transparent px-1 text-xs font-medium text-zinc-700 outline-none transition-colors hover:border-slate-500 focus-visible:border-slate-500 focus-visible:ring-0 sm:flex-none'
            >
              {seasons.map((season) => (
                <option key={season.id} value={season.season_number}>
                  {season.name}
                </option>
              ))}
            </select>

            <label className='sr-only' htmlFor='tv-episode'>
              <I18nText messageKey='detail.selectEpisode' />
            </label>
            <select
              id='tv-episode'
              value={selectedEpisode}
              onChange={(event) => setSelectedEpisode(event.target.value)}
              disabled={status !== 'ready' || episodes.length === 0}
              className='h-9 min-w-28 flex-1 rounded-none border-0 border-b border-zinc-300 bg-transparent px-1 text-xs font-medium text-zinc-700 outline-none transition-colors hover:border-slate-500 focus-visible:border-slate-500 focus-visible:ring-0 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 sm:flex-none'
            >
              {episodes.map((item) => (
                <option key={item.id} value={item.episode_number}>
                  EP {String(item.episode_number).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div
        className='mt-5 min-h-28 border-t border-zinc-100 pt-5'
        aria-live='polite'
      >
        {!initialSeason && (
          <p className='text-sm text-zinc-500'>
            <I18nText messageKey='detail.noEpisodes' />
          </p>
        )}
        {initialSeason && status === 'loading' && (
          <p className='py-4 text-sm text-zinc-500'>
            <I18nText messageKey='detail.loadingEpisodes' />
          </p>
        )}
        {initialSeason && status === 'error' && (
          <p className='py-4 text-sm text-rose-600'>
            <I18nText messageKey='detail.episodeLoadFailed' />
          </p>
        )}
        {initialSeason && status === 'ready' && !episode && (
          <p className='py-4 text-sm text-zinc-500'>
            <I18nText messageKey='detail.noEpisode' />
          </p>
        )}
        {episode && (
          <article>
            <div className='flex flex-wrap items-baseline justify-between gap-2'>
              <h3 className='text-lg font-semibold tracking-[-0.02em] text-zinc-950'>
                {episode.name}
              </h3>
              <div className='flex items-center gap-2 text-xs font-medium text-zinc-500'>
                <span>
                  {episode.air_date || (
                    <I18nText messageKey='detail.unknownDate' />
                  )}
                </span>
                {episode.runtime && (
                  <>
                    <span className='h-3 w-px bg-zinc-300' aria-hidden='true' />
                    <span>
                      {episode.runtime}
                      <I18nText messageKey='detail.minutes' />
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className='mt-3 max-w-[68ch] text-sm leading-6 text-zinc-600'>
              {episode.overview || <I18nText messageKey='detail.noOverview' />}
            </p>
          </article>
        )}
      </div>
    </section>
  );
}
