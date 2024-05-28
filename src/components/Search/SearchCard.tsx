import { Media, Movie } from '@/lib/data';
import { getBase64 } from '@/lib/helpers';
import Image from 'next/image';
import Link from 'next/link';

export default async function SearchCard({ data }: { data: Media }) {
  const isFilm = 'title' in data;
  const MediaType = isFilm ? 'film' : 'tv';
  const MediaName = isFilm ? data.title : data.name;
  return (
    <div className='flex w-[100px] flex-col gap-1 md:w-[150px]'>
      <Link
        href={`/${MediaType}/${data.id}`}
        className='aspect-[2/3] select-none overflow-hidden rounded-lg shadow-md'
      >
        {data.poster_path ? (
          <Image
            src={`https://media.themoviedb.org/t/p/w600_and_h900_bestv2${data.poster_path}`}
            alt={`${MediaName}'s Photos`}
            width={150}
            height={225}
            className='object-cover'
            overrideSrc={`/${MediaName}.jpg`}
            placeholder='blur'
            blurDataURL={await getBase64(
              `https://media.themoviedb.org/t/p/w600_and_h900_bestv2${data.poster_path}`,
            )}
          />
        ) : (
          <div className='flex aspect-[2/3] items-center justify-center '>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              stroke='black'
              fill='none'
              className='size-10 w-fit object-cover'
            >
              <path
                fillRule='evenodd'
                d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        )}
      </Link>

      <h2 className='text-xm inline-block truncate text-left font-semibold'>
        {MediaName}
      </h2>
      <p className='-mt-1 inline-block text-left text-xs text-gray-800'>
        {isFilm ? data.release_date : data.first_air_date}
      </p>
    </div>
  );
}
