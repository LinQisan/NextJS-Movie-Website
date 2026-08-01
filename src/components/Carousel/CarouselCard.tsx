'use client';

import Link from 'next/link';
import * as m from 'motion/react-m';
import { useI18n } from '../I18nProvider';
import ImageHolder from '../ui/ImageHolder';

export default function CarouselCard({
  imgUrl,
  name,
  year,
  id,
}: {
  imgUrl: string;
  name: string;
  year: number;
  id: number;
}) {
  const { t } = useI18n();

  return (
    <m.article
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className='flex w-[140px] flex-col gap-1.5 will-change-transform sm:w-[160px] lg:w-[180px]'
    >
      <Link
        href={`/film/${id}`}
        className='aspect-[2/3] select-none overflow-hidden rounded-lg shadow-md'
      >
        <ImageHolder
          src={imgUrl}
          alt={t('media.posterAlt', { name })}
          width={200}
          height={300}
        />
      </Link>
      <h2 className='inline-block truncate text-left text-sm font-semibold sm:text-base'>
        {name}
      </h2>
      <p className='-mt-1 inline-block text-left text-xs text-gray-800 '>
        {year}
      </p>
    </m.article>
  );
}
