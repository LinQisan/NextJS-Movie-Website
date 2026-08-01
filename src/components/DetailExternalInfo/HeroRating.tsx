'use client';

import { useI18n } from '@/components/I18nProvider';

import {
  useExternalRatings,
  type ExternalRatingsProps,
} from './ExternalRatings';

export default function HeroRating(props: ExternalRatingsProps) {
  const { t } = useI18n();
  const { weighted } = useExternalRatings(props);
  const score = weighted?.score;
  const formattedScore = score === undefined ? '—' : score.toFixed(1);

  return (
    <span
      className='font-semibold text-white'
      aria-label={`${t('detail.combinedRating')}: ${formattedScore}`}
    >
      <span className='mr-1 text-slate-300' aria-hidden='true'>
        ★
      </span>
      <span className='inline-block min-w-[2ch] tabular-nums transition-all duration-500'>
        {formattedScore}
      </span>
    </span>
  );
}
