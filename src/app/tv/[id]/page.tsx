import { Suspense, type ReactNode } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { findBangumiAnime } from '@/lib/bangumi';
import Credits from '@/components/Credits/Credits';
import DetailTheme from '@/components/DetailTheme/DetailTheme';
import CreditsLoading from '@/components/Loading/CreditsLoading';
import ExternalRatings, {
  type ExternalRatingsProps,
} from '@/components/DetailExternalInfo/ExternalRatings';
import HeroRating from '@/components/DetailExternalInfo/HeroRating';
import { I18nText } from '@/components/I18nProvider';
import HeroGradient from '@/components/Motion/HeroGradient';
import { Reveal } from '@/components/Motion/Reveal';
import SeasonsSelect from '@/components/SeasonSelect/SeasonsSelect';
import ImageHolder from '@/components/ui/ImageHolder';

import { DEFAULT_LOCALE, LOCALE_COOKIE, localeFromValue } from '@/lib/i18n';
import {
  fetchTVDetails,
  getTranslationTitles,
  TMDBError,
  type TVDetail,
} from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await loadTV(id);

  return {
    title: data.name,
    openGraph: {
      title: data.name,
      description: data.overview.slice(0, 160),
      images: data.backdrop_path
        ? [`https://image.tmdb.org/t/p/original${data.backdrop_path}`]
        : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadTV(id);
  const locale = localeFromValue(
    (await cookies()).get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE,
  );
  const certification = getCertificationByCountry(
    data.content_ratings.results,
    'US',
  );
  const primarySeasons = getPrimarySeasons(data.seasons);
  const summarySeasons =
    primarySeasons.length > 0 ? primarySeasons : data.seasons;
  const seasonCount = summarySeasons.length;
  const episodeCount = summarySeasons.reduce(
    (total, season) => total + season.episode_count,
    0,
  );
  const isAnimation = data.genres.some((genre) => genre.id === 16);
  const translatedTitles = getTranslationTitles(data.translations, 'name');
  const bangumi = isAnimation
    ? await findBangumiAnime({
        title: data.name,
        originalTitle: data.original_name,
        titles: translatedTitles,
        year: data.first_air_date?.slice(0, 4),
        media: 'tv',
      })
    : null;
  const backdropUrl = data.backdrop_path
    ? `https://image.tmdb.org/t/p/original${data.backdrop_path}`
    : null;
  const tmdbPosterUrl = data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
    : null;
  const posterUrl =
    locale === 'zh' && bangumi?.image
      ? bangumi.image
      : tmdbPosterUrl ?? bangumi?.image ?? null;
  const ratingProps = {
    imdbId: data.external_ids?.imdb_id,
    tmdbId: data.id,
    tmdbScore: data.vote_average,
    tmdbVotes: data.vote_count,
    title: data.name,
    originalTitle: data.original_name,
    titles: getTranslationTitles(data.translations, 'name'),
    year: data.first_air_date?.slice(0, 4),
    doubanKey: `tv:${data.id}`,
    media: 'tv',
    isAnimation,
    bangumi,
  } satisfies ExternalRatingsProps;

  return (
    <DetailTheme imageUrl={posterUrl}>
      <div className='relative mx-auto w-full max-w-6xl'>
        <Atmosphere backdropUrl={backdropUrl} />

        <Reveal amount={0.08}>
          <TVHero
            data={data}
            certification={certification}
            seasonCount={seasonCount}
            episodeCount={episodeCount}
            backdropUrl={backdropUrl}
            posterUrl={posterUrl}
            ratingProps={ratingProps}
          />
        </Reveal>

        <div className='mt-10 grid min-w-0 grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-0'>
          <main className='order-2 min-w-0 space-y-12 lg:order-1 lg:col-start-1 lg:row-start-1 lg:pr-12'>
            <Reveal>
              <section className='border-t border-zinc-200/80 pt-8'>
                <SectionHeading>
                  <I18nText messageKey='detail.overview' />
                </SectionHeading>
                <p className='mt-4 max-w-[68ch] text-[15px] leading-7 text-zinc-600'>
                  {data.overview || <I18nText messageKey='detail.noOverview' />}
                </p>
              </section>
            </Reveal>

            <Reveal>
              <Suspense fallback={<CreditsLoading />}>
                <Credits
                  id={id}
                  media='tv'
                  bangumiCharacters={bangumi?.characters}
                />
              </Suspense>
            </Reveal>

            <Reveal>
              <Suspense>
                <SeasonsSelect id={id} seasons={data.seasons} />
              </Suspense>
            </Reveal>
          </main>

          <Reveal
            className='order-1 min-w-0 lg:order-2 lg:col-start-2 lg:row-start-1 lg:border-l lg:border-zinc-200/80 lg:pl-12'
            delay={0.08}
          >
            <TVInfoSidebar
              data={data}
              certification={certification}
              seasonCount={seasonCount}
              episodeCount={episodeCount}
              ratingProps={ratingProps}
            />
          </Reveal>
        </div>
      </div>
    </DetailTheme>
  );
}

function Atmosphere({ backdropUrl }: { backdropUrl: string | null }) {
  return (
    <div
      className='pointer-events-none absolute left-1/2 top-[-8rem] -z-10 h-[620px] w-screen -translate-x-1/2 overflow-hidden'
      aria-hidden='true'
    >
      {backdropUrl ? (
        <div
          className='absolute inset-0 scale-110 bg-cover bg-center opacity-25 blur-3xl saturate-[0.55]'
          style={{ backgroundImage: `url("${backdropUrl}")` }}
        />
      ) : (
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgb(100_116_139_/_0.2),transparent_55%)]' />
      )}
      <div className='detail-atmosphere-fade absolute inset-0' />
    </div>
  );
}

function TVHero({
  data,
  certification,
  seasonCount,
  episodeCount,
  backdropUrl,
  posterUrl,
  ratingProps,
}: {
  data: TVDetail;
  certification: string | null;
  seasonCount: number;
  episodeCount: number;
  backdropUrl: string | null;
  posterUrl: string | null;
  ratingProps: ExternalRatingsProps;
}) {
  const year = data.first_air_date?.slice(0, 4);

  return (
    <section className='detail-hero relative left-1/2 isolate w-screen -translate-x-1/2 overflow-hidden'>
      <div className='relative aspect-[4/3] sm:aspect-[2/1] lg:aspect-[2.15/1]'>
        {backdropUrl ? (
          <div className='absolute inset-0 select-none'>
            <ImageHolder
              src={backdropUrl}
              alt={`${data.name}'s backdrop`}
              width={1200}
              height={558}
              priority={true}
            />
          </div>
        ) : (
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgb(100_116_139_/_0.45),transparent_45%),linear-gradient(135deg,#18181b,#09090b)]' />
        )}

        <HeroGradient />
        <div className='relative z-20 flex min-h-full items-end p-6 sm:p-10'>
          <div className='flex items-end gap-4 sm:gap-6'>
            {posterUrl && (
              <div className='w-24 shrink-0 overflow-hidden rounded-xl border border-white/25 bg-black/20 shadow-[0_20px_45px_-20px_rgba(0,0,0,0.9)] ring-1 ring-black/10 sm:w-32 lg:w-44'>
                <div className='aspect-[2/3]'>
                  <ImageHolder
                    src={posterUrl}
                    alt={`${data.name}'s poster`}
                    width={400}
                    height={600}
                    priority={true}
                  />
                </div>
              </div>
            )}
            <div className='w-full min-w-0 max-w-4xl flex-1'>
              {data.original_name !== data.name && (
                <p className='text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60'>
                  <I18nText messageKey='detail.originalTitle' />:{' '}
                  {data.original_name}
                </p>
              )}
              <h1 className='mt-2 max-w-4xl break-words text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl'>
                {data.name}
              </h1>
              {data.tagline && (
                <p className='mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base'>
                  {data.tagline}
                </p>
              )}

              <div className='mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-white/80'>
                <span>
                  {year || <I18nText messageKey='detail.unknownDate' />}
                </span>
                <MetaDivider />
                <span>
                  {seasonCount} <I18nText messageKey='detail.seasons' />
                </span>
                <MetaDivider />
                <span>
                  {episodeCount} <I18nText messageKey='detail.episodeCount' />
                </span>
                {certification && (
                  <>
                    <MetaDivider />
                    <span className='border border-white/35 px-1.5 py-0.5 text-white'>
                      {certification}
                    </span>
                  </>
                )}
                <MetaDivider />
                <HeroRating {...ratingProps} />
              </div>

              <div className='mt-3 flex flex-wrap items-center gap-x-2 text-xs text-white/70'>
                {data.genres.map((genre, index) => (
                  <span
                    key={genre.id}
                    className='inline-flex items-center gap-2'
                  >
                    {index > 0 && (
                      <span className='text-white/35' aria-hidden='true'>
                        /
                      </span>
                    )}
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TVInfoSidebar({
  data,
  certification,
  seasonCount,
  episodeCount,
  ratingProps,
}: {
  data: TVDetail;
  certification: string | null;
  seasonCount: number;
  episodeCount: number;
  ratingProps: ExternalRatingsProps;
}) {
  return (
    <aside className='space-y-10 lg:sticky lg:top-6'>
      <ExternalRatings {...ratingProps} />

      <section>
        <SectionEyebrow>
          <I18nText messageKey='detail.seriesDetails' />
        </SectionEyebrow>

        <dl className='mt-5 grid grid-cols-2 gap-x-5 gap-y-5'>
          <InfoStat
            className='border-b border-zinc-200/70 pb-4'
            label={<I18nText messageKey='detail.firstAirDate' />}
            value={
              data.first_air_date || (
                <I18nText messageKey='detail.unknownDate' />
              )
            }
          />
          <InfoStat
            className='border-b border-zinc-200/70 pb-4'
            label={<I18nText messageKey='detail.seasons' />}
            value={`${seasonCount}`}
          />
          <InfoStat
            className='border-b border-zinc-200/70 pb-4'
            label={<I18nText messageKey='detail.episodeCount' />}
            value={`${episodeCount}`}
          />
          <InfoStat
            className='border-b border-zinc-200/70 pb-4'
            label={<I18nText messageKey='detail.certification' />}
            value={certification || '—'}
          />
        </dl>

        <div className='mt-8 border-t border-zinc-200/70 pt-6'>
          <SectionEyebrow>
            <I18nText messageKey='detail.genres' />
          </SectionEyebrow>
          <p className='mt-3 text-sm leading-6 text-zinc-700'>
            {data.genres.map((genre, index) => (
              <span key={genre.id}>
                {index > 0 && <span className='mx-2 text-zinc-300'>/</span>}
                {genre.name}
              </span>
            ))}
          </p>
        </div>

        <div className='mt-8 border-t border-zinc-200/70 pt-6'>
          <SectionEyebrow>
            <I18nText messageKey='detail.production' />
          </SectionEyebrow>
          {data.production_companies.length > 0 ? (
            <ul className='mt-3 space-y-1.5 text-sm leading-6 text-zinc-700'>
              {data.production_companies.map((company) => (
                <li key={company.id}>{company.name}</li>
              ))}
            </ul>
          ) : (
            <p className='mt-3 text-sm text-zinc-400'>—</p>
          )}
        </div>
      </section>
    </aside>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-lg font-semibold tracking-[-0.02em] text-zinc-950'>
      {children}
    </h2>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400'>
      {children}
    </h2>
  );
}

function InfoStat({
  label,
  value,
  className = '',
}: {
  label: ReactNode;
  value: ReactNode;
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

function MetaDivider() {
  return <span className='h-3 w-px bg-white/30' aria-hidden='true' />;
}

async function loadTV(id: string) {
  try {
    return await fetchTVDetails(id);
  } catch (error) {
    if (error instanceof TMDBError && [400, 404].includes(error.status)) {
      notFound();
    }
    throw error;
  }
}

function getCertificationByCountry(
  data: TVDetail['content_ratings']['results'],
  isoCode: string,
) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  return data.find((item) => item.iso_3166_1 === isoCode)?.rating ?? null;
}

function getPrimarySeasons(seasons: TVDetail['seasons']) {
  return seasons.filter((season) => season.season_number > 0);
}
