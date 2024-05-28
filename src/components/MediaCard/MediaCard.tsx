import Image from 'next/image';
import Link from 'next/link';

import { getBase64 } from '@/lib/helpers';
import clsx from 'clsx';

type Media = {
  imgUrl: string;
  name: string;
  id: number;
  year?: number;
  movie?: boolean;
};

export default async function MediaCard({
  imgUrl,
  name,
  id,
  year,
  movie,
}: Media) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-1',
        !movie && 'w-[337.5px]',
        movie && 'w-[100px] md:w-[150px]',
      )}
    >
      <Link
        href={`/${movie ? 'film' : 'tv'}/${id}`}
        className={clsx(
          'select-none overflow-hidden rounded-lg shadow-md',
          !movie && 'aspect-[16/9]',
          movie && 'aspect-[2/3]',
        )}
      >
        <Image
          src={imgUrl}
          alt={`${name}'s piture`}
          width={movie ? 150 : 337.5}
          height={225}
          overrideSrc={`/${name}.jpg`}
          placeholder='blur'
          blurDataURL={await getBase64(imgUrl)}
          className='object-cover'
        />
      </Link>
      <h2
        className={clsx(
          'text-xm inline-block truncate font-semibold',
          movie && 'text-left',
          !movie && 'text-center',
        )}
      >
        {name}
      </h2>
      {year && (
        <p className='-mt-1 inline-block text-left text-xs text-gray-800'>
          {year}
        </p>
      )}
    </div>
  );
}
