'use client';

import * as m from 'motion/react-m';

import { I18nText } from '@/components/I18nProvider';
import { localeConfig, type Locale } from '@/lib/i18n';
import type { WeightedRating } from '@/lib/rating-score';

type RatingChartProps = {
  ratings: WeightedRating[];
  locale: Locale;
};

/**
 * A compact, linkable comparison chart. Score bars use the normalised 0–10
 * value; vote bars use a logarithmic scale so a very large IMDb audience does
 * not make every other platform look empty.
 */
export default function RatingChart({ ratings, locale }: RatingChartProps) {
  if (ratings.length === 0) return null;

  const maxVoteLog = Math.max(
    ...ratings.map((rating) => getVoteLog(rating.votes)),
    0,
  );

  return (
    <div className='rating-chart mt-6' aria-label='Rating comparison chart'>
      <div className='mb-3 flex items-end justify-between gap-3'>
        <p className='text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400'>
          <I18nText messageKey='detail.ratingComparison' />
        </p>
        <p className='text-right text-[9px] font-medium uppercase tracking-[0.1em] text-zinc-400'>
          <I18nText messageKey='detail.score' /> ·{' '}
          <I18nText messageKey='detail.voters' />
        </p>
      </div>

      <div className='space-y-3'>
        {ratings.map((rating, index) => {
          const score = clamp(rating.normalizedScore, 0, 10);
          const votes = getPositiveVotes(rating.votes);
          const voteRatio = votes
            ? maxVoteLog > 0
              ? getVoteLog(votes) / maxVoteLog
              : 1
            : 0;
          const scoreLabel = score.toFixed(1);

          return (
            <a
              key={`${rating.source}:${rating.href}:${index}`}
              href={rating.href}
              target='_blank'
              rel='noreferrer'
              className='rating-chart-row group block rounded-md px-1 py-1.5 transition-colors hover:bg-[rgba(var(--theme-accent-rgb),0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--theme-accent-rgb),0.3)]'
            >
              <div className='flex items-center justify-between gap-3'>
                <span className='flex min-w-0 items-center gap-2'>
                  <span
                    className='size-1.5 shrink-0 rounded-full bg-[var(--theme-accent)] transition-transform duration-300 group-hover:scale-125'
                    aria-hidden='true'
                  />
                  <span className='truncate text-xs font-semibold text-zinc-800 transition-colors group-hover:text-[var(--theme-accent)]'>
                    {rating.source}
                  </span>
                </span>
                <strong className='shrink-0 text-sm font-semibold tabular-nums tracking-[-0.02em] text-zinc-950'>
                  {scoreLabel}
                  <span className='ml-0.5 text-[9px] font-medium tracking-normal text-zinc-400'>
                    /10
                  </span>
                </strong>
              </div>

              <div className='mt-1.5 flex items-center gap-2'>
                <div className='rating-chart-track h-1.5 min-w-0 flex-1 overflow-hidden rounded-full'>
                  <m.div
                    className='rating-chart-score h-full origin-left rounded-full'
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: score / 10 }}
                    transition={{
                      duration: 0.55,
                      delay: index * 0.045,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ width: '100%' }}
                    aria-hidden='true'
                  />
                </div>
              </div>

              <div className='mt-1.5 flex items-center gap-2'>
                <span className='w-10 shrink-0 text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-400'>
                  <I18nText messageKey='detail.votes' />
                </span>
                <div className='rating-chart-vote-track h-1 min-w-0 flex-1 overflow-hidden rounded-full'>
                  <m.div
                    className='rating-chart-vote h-full origin-left rounded-full'
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: voteRatio }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.045 + 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ width: '100%' }}
                    aria-hidden='true'
                  />
                </div>
                <span className='w-12 shrink-0 text-right text-[10px] tabular-nums text-zinc-400'>
                  {votes ? formatCount(votes, locale) : '—'}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <p className='mt-3 text-[9px] leading-4 text-zinc-400'>
        <I18nText messageKey='detail.votesScale' />
      </p>
    </div>
  );
}

function getPositiveVotes(value?: number) {
  return Number.isFinite(value) && value && value > 0 ? value : null;
}

function getVoteLog(value?: number | null) {
  return value && value > 0 ? Math.log10(value + 1) : 0;
}

function formatCount(value: number, locale: Locale) {
  return new Intl.NumberFormat(localeConfig[locale].html, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
