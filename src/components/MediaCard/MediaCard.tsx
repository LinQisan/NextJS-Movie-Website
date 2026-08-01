'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';

import ImageHolder from '../ui/ImageHolder';
import { useI18n } from '../I18nProvider';

import { cn } from '@/lib/utils';

type Media = {
  imgUrl: string;
  name: string;
  id: number;
  year?: number;
  movie?: boolean;
};

export default function MediaCard({ imgUrl, name, id, year, movie }: Media) {
  const { t } = useI18n();

  return (
    <m.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className={cn(
        'mx-auto flex w-full max-w-[400px] flex-col gap-1.5 will-change-transform',
        movie && 'w-[100px] md:w-[150px]',
      )}
    >
      <Link
        href={`/${movie ? 'film' : 'tv'}/${id}`}
        className={cn(
          'aspect-[16/9] select-none overflow-hidden rounded-lg shadow-md',
          movie && 'aspect-[2/3]',
        )}
      >
        <ImageHolder
          src={imgUrl}
          alt={t('media.backdropAlt', { name })}
          width={movie ? 150 : 400}
          height={225}
        />
      </Link>
      <h2
        className={cn(
          'inline-block truncate text-left text-base font-semibold',
          movie && 'text-left',
        )}
      >
        {name}
      </h2>
      {year && (
        <p className='-mt-1 inline-block text-left text-xs text-gray-800'>
          {year}
        </p>
      )}
    </m.div>
  );
}
