'use client';

import type { Episode, Season } from '@/lib/data';
import { localeConfig, type Locale } from '@/lib/i18n';
import React from 'react';

import { I18nText, useI18n } from '../I18nProvider';
import ImageHolder from '../ui/ImageHolder';

type EpisodeStatus = 'loading' | 'ready' | 'error';

type PickerOption = {
  value: string;
  label: string;
  meta?: string;
  group?: string;
};

const episodeCache = new Map<string, Episode[]>();

export default function SeasonsSelect({
  id,
  seasons,
}: {
  id: string;
  seasons: Season[];
}) {
  const { locale, t } = useI18n();
  const regularSeasons = React.useMemo(
    () => seasons.filter((season) => season.season_number > 0),
    [seasons],
  );
  const specialSeasons = React.useMemo(
    () => seasons.filter((season) => season.season_number <= 0),
    [seasons],
  );
  const firstSeason = regularSeasons[0] ?? specialSeasons[0];
  const firstSeasonValue = String(firstSeason?.season_number ?? '');
  const [selectedSeason, setSelectedSeason] = React.useState(firstSeasonValue);
  const [selectedEpisode, setSelectedEpisode] = React.useState('');
  const [episodes, setEpisodes] = React.useState<Episode[]>([]);
  const [status, setStatus] = React.useState<EpisodeStatus>(
    firstSeason ? 'loading' : 'ready',
  );
  const [loadedKey, setLoadedKey] = React.useState('');
  const [retryKey, setRetryKey] = React.useState(0);
  const requestKeyRef = React.useRef('');

  const activeSeason = seasons.some(
    (season) => String(season.season_number) === selectedSeason,
  )
    ? selectedSeason
    : firstSeasonValue;
  const activeCacheKey = activeSeason ? `${id}:${activeSeason}:${locale}` : '';

  const seasonOptions = React.useMemo<PickerOption[]>(() => {
    const regularOptions = regularSeasons.map((season) => ({
      value: String(season.season_number),
      label: season.name || `S${String(season.season_number).padStart(2, '0')}`,
      meta: `${season.episode_count} ${t('detail.episodeCount').trim()}`,
      group: t('detail.seasons'),
    }));
    const specialOptions = specialSeasons.map((season) => ({
      value: String(season.season_number),
      label:
        season.name ||
        `${t('detail.specials')} ${String(season.season_number).padStart(2, '0')}`,
      meta: `${season.episode_count} ${t('detail.episodeCount').trim()}`,
      group: t('detail.specials'),
    }));
    return [...regularOptions, ...specialOptions];
  }, [regularSeasons, specialSeasons, t]);

  const episodeOptions = React.useMemo<PickerOption[]>(
    () =>
      episodes.map((episode) => ({
        value: String(episode.episode_number),
        label: `EP ${String(episode.episode_number).padStart(2, '0')}`,
        meta: [episode.name, formatEpisodeDate(episode.air_date, locale)]
          .filter(Boolean)
          .join(' · '),
      })),
    [episodes, locale],
  );

  React.useEffect(() => {
    if (!activeSeason) {
      requestKeyRef.current = '';
      return;
    }

    const cacheKey = `${id}:${activeSeason}:${locale}`;
    requestKeyRef.current = cacheKey;
    const cachedEpisodes = episodeCache.get(cacheKey);
    let active = true;

    if (cachedEpisodes) {
      void Promise.resolve().then(() => {
        if (!active || requestKeyRef.current !== cacheKey) {
          return;
        }
        setEpisodes(cachedEpisodes);
        setSelectedEpisode((current) =>
          cachedEpisodes.some(
            (episode) => String(episode.episode_number) === current,
          )
            ? current
            : String(cachedEpisodes[0]?.episode_number ?? ''),
        );
        setLoadedKey(cacheKey);
        setStatus('ready');
      });
      return () => {
        active = false;
      };
    }

    const controller = new AbortController();

    async function loadEpisodes() {
      try {
        const response = await fetch(`/api/${id}?season=${activeSeason}`, {
          signal: controller.signal,
        });
        const json = (await response.json()) as {
          data?: { episodes?: Episode[] };
          error?: string;
        };
        if (!response.ok) {
          throw new Error(json.error || 'Unable to load episodes.');
        }

        const nextEpisodes = json.data?.episodes ?? [];
        episodeCache.set(cacheKey, nextEpisodes);
        if (!active || requestKeyRef.current !== cacheKey) {
          return;
        }
        setEpisodes(nextEpisodes);
        setSelectedEpisode(String(nextEpisodes[0]?.episode_number ?? ''));
        setLoadedKey(cacheKey);
        setStatus('ready');
      } catch (error) {
        if (isAbortError(error) || !active) {
          return;
        }
        if (requestKeyRef.current === cacheKey) {
          setEpisodes([]);
          setSelectedEpisode('');
          setLoadedKey(cacheKey);
          setStatus('error');
        }
      }
    }

    void loadEpisodes();
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeSeason, id, locale, retryKey]);

  const isCurrentDataReady = status === 'ready' && loadedKey === activeCacheKey;
  const isCurrentError = status === 'error' && loadedKey === activeCacheKey;
  const isCurrentLoading = !isCurrentDataReady && !isCurrentError;
  const episode = isCurrentDataReady
    ? episodes.find((item) => item.episode_number === Number(selectedEpisode))
    : undefined;

  return (
    <section
      className='border-t border-zinc-200/80 pt-8'
      aria-labelledby='episode-info-heading'
    >
      <div className='flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between'>
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
          {firstSeason && (
            <p className='mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500'>
              {regularSeasons.length > 0 && (
                <span>
                  {regularSeasons.length} {t('detail.seasons').trim()}
                </span>
              )}
              {specialSeasons.length > 0 && (
                <>
                  {regularSeasons.length > 0 && (
                    <span aria-hidden='true'>·</span>
                  )}
                  <span>
                    {specialSeasons.length} {t('detail.specials').trim()}
                  </span>
                </>
              )}
            </p>
          )}
        </div>

        {firstSeason && (
          <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
            <ThemedPicker
              id='tv-season'
              label={t('detail.selectSeason')}
              value={activeSeason}
              options={seasonOptions}
              onChange={(value) => {
                setSelectedSeason(value);
                setSelectedEpisode('');
                setEpisodes([]);
                setLoadedKey('');
                setStatus('loading');
              }}
              className='sm:min-w-52'
            />
            <ThemedPicker
              id='tv-episode'
              label={t('detail.selectEpisode')}
              value={selectedEpisode}
              options={episodeOptions}
              onChange={setSelectedEpisode}
              key={`episode-picker-${isCurrentDataReady}`}
              disabled={!isCurrentDataReady || episodes.length === 0}
              className='sm:min-w-64'
            />
          </div>
        )}
      </div>

      <div
        className='mt-5 min-h-28 border-t border-zinc-100 pt-5'
        aria-live='polite'
      >
        {!firstSeason && (
          <p className='text-sm text-zinc-500'>
            <I18nText messageKey='detail.noEpisodes' />
          </p>
        )}
        {firstSeason && isCurrentLoading && (
          <div className='flex items-center gap-3 py-4 text-sm text-zinc-500'>
            <span
              className='h-2 w-2 animate-pulse rounded-full bg-slate-400'
              aria-hidden='true'
            />
            <I18nText messageKey='detail.loadingEpisodes' />
          </div>
        )}
        {firstSeason && isCurrentError && (
          <div className='flex flex-wrap items-center gap-3 py-4 text-sm text-zinc-600'>
            <p>
              <I18nText messageKey='detail.episodeLoadFailed' />
            </p>
            <button
              type='button'
              onClick={() => {
                setEpisodes([]);
                setSelectedEpisode('');
                setLoadedKey('');
                setStatus('loading');
                setRetryKey((current) => current + 1);
              }}
              className='detail-picker-action'
            >
              <I18nText messageKey='error.reload' />
            </button>
          </div>
        )}
        {firstSeason && isCurrentDataReady && !episode && (
          <p className='py-4 text-sm text-zinc-500'>
            <I18nText messageKey='detail.noEpisode' />
          </p>
        )}
        {episode && isCurrentDataReady && (
          <EpisodeDetail
            episode={episode}
            locale={locale}
            seasonNumber={Number(activeSeason)}
          />
        )}
      </div>
    </section>
  );
}

function ThemedPicker({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = '',
}: {
  id: string;
  label: string;
  value: string;
  options: PickerOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);
  const menuId = `${id}-menu`;

  React.useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <span className='sr-only' id={`${id}-label`}>
        {label}
      </span>
      <button
        type='button'
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-controls={menuId}
        aria-labelledby={`${id}-label`}
        disabled={disabled || options.length === 0}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if ((event.key === 'ArrowDown' || event.key === 'Enter') && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className='detail-picker-trigger flex h-11 w-full items-center justify-between gap-4 rounded-xl px-3.5 text-left text-xs font-medium outline-none transition sm:min-w-0'
      >
        <span className='min-w-0 truncate'>{selected?.label || label}</span>
        <span className='flex shrink-0 items-center gap-2 text-zinc-400'>
          {selected?.meta && (
            <span className='hidden max-w-28 truncate text-[10px] font-normal sm:inline'>
              {selected.meta}
            </span>
          )}
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && !disabled && options.length > 0 && (
        <div
          id={menuId}
          role='listbox'
          aria-label={label}
          className='detail-picker-menu absolute right-0 z-50 mt-2 max-h-80 w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-xl p-1.5 shadow-xl'
        >
          {options.map((option, index) => {
            const showGroup =
              index === 0 || options[index - 1]?.group !== option.group;
            const isSelected = option.value === value;
            return (
              <React.Fragment key={option.value}>
                {option.group && showGroup && (
                  <p className='detail-picker-group px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em]'>
                    {option.group}
                  </p>
                )}
                <button
                  type='button'
                  role='option'
                  aria-selected={isSelected}
                  data-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className='detail-picker-option flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs transition-colors'
                >
                  <span className='min-w-0 truncate'>{option.label}</span>
                  {option.meta && (
                    <span className='shrink-0 text-[10px] opacity-65'>
                      {option.meta}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EpisodeDetail({
  episode,
  locale,
  seasonNumber,
}: {
  episode: Episode;
  locale: Locale;
  seasonNumber: number;
}) {
  const stillUrl = episode.still_path
    ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
    : null;
  const episodeCode = `S${String(seasonNumber).padStart(2, '0')} · E${String(
    episode.episode_number,
  ).padStart(2, '0')}`;

  return (
    <article
      className={
        stillUrl
          ? 'grid gap-5 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-6'
          : ''
      }
    >
      {stillUrl && (
        <div className='aspect-video overflow-hidden rounded-xl bg-zinc-100/70'>
          <ImageHolder
            src={stillUrl}
            alt={episode.name}
            width={500}
            height={281}
          />
        </div>
      )}
      <div className='min-w-0'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='min-w-0'>
            <p className='text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400'>
              {episodeCode}
            </p>
            <h3 className='mt-1 break-words text-lg font-semibold tracking-[-0.02em] text-zinc-950'>
              {episode.name}
            </h3>
          </div>
          <div className='flex shrink-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-zinc-500'>
            <span>
              {formatEpisodeDate(episode.air_date, locale) || (
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
            {episode.vote_average > 0 && (
              <>
                <span className='h-3 w-px bg-zinc-300' aria-hidden='true' />
                <span>★ {episode.vote_average.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
        <p className='mt-3 max-w-[68ch] text-sm leading-6 text-zinc-600'>
          {episode.overview || <I18nText messageKey='detail.noOverview' />}
        </p>
      </div>
    </article>
  );
}

function formatEpisodeDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return '';
  }
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat(localeConfig[locale].html, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 16 16'
      className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
    >
      <path d='m4 6 4 4 4-4' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}
