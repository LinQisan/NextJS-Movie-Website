import { Suspense } from 'react';
import { Metadata } from 'next';
import Image from 'next/image';

import { getBase64 } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { fetchTVDetails } from '@/lib/data';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import SeasonsLayout from '@/components/SeasonSelect/SeasonsLayout';
import Credits from '@/components/Credits/Credits';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await fetchTVDetails(params.id);
  return {
    title: data.name,
    openGraph: {
      title: data.name,
      description: data.overview.slice(0, 5),
      images: [`https://image.tmdb.org/t/p/original${data.backdrop_path}`],
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchTVDetails(params.id);

  return (
    <div className='mx-auto flex max-w-fit flex-col justify-center gap-2 '>
      {data.backdrop_path && (
        <div className='relative max-w-fit'>
          <div className='aspect-video w-[380px] select-none overflow-hidden rounded-lg shadow-md md:w-[600px]'>
            <Image
              src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
              alt={`${data.name}'s backdrop`}
              width={600}
              height={300}
              className='object-cover'
              overrideSrc={`/${data.name}.jpg`}
              placeholder='blur'
              blurDataURL={await getBase64(
                `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
              )}
            />
          </div>
          <div className='absolute bottom-0 left-0 w-full rounded p-2 text-white backdrop-blur-md backdrop-brightness-50 backdrop-filter'>
            <h2
              className={cn('font-semibold', {
                hidden: data.original_name === data.name,
              })}
            >
              {data.original_name}
            </h2>
            <p className='text-sm'>{data.tagline}</p>
          </div>
        </div>
      )}
      <div className='flex flex-col gap-2 text-left'>
        <h2 className='w-[380px] text-justify text-4xl font-semibold md:w-[600px]'>
          {data.name}
        </h2>
        <div className='flex gap-2'>
          <Badge
            variant='secondary'
            className={cn(
              'w-fit select-none rounded-md bg-zinc-950 px-1 font-mono text-xs font-light text-white hover:bg-zinc-900',
              {
                hidden: !getCertificationByCountry(
                  data.content_ratings.results,
                  'US',
                ),
              },
            )}
          >
            {getCertificationByCountry(data.content_ratings.results, 'US')}
          </Badge>
          <p>{data.first_air_date.slice(0, 4)}</p>
          <Badge
            variant='secondary'
            className={cn(
              'w-fit select-none rounded-md bg-gray-200 px-1 font-mono text-xs font-light text-black hover:bg-gray-100',
            )}
          >
            <span className='font-bold'>{data.seasons.length}</span>
            &nbsp;seasons
          </Badge>
          <p>{data.vote_average.toFixed(1)}</p>
        </div>

        <p className='w-[380px] text-justify font-light md:w-[600px]'>
          {data.overview}
        </p>
      </div>
      <div className='flex gap-2'>
        {data.genres.map((i: any) => (
          <Badge variant='outline' key={i.id}>
            {i.name}
          </Badge>
        ))}
      </div>
      <Suspense>
        <Credits id={params.id} media='tv' />
      </Suspense>
      <Separator />
      <Suspense>
        <SeasonsLayout id={params.id} seasons={data.seasons}></SeasonsLayout>
      </Suspense>
      {data.production_companies.length > 0 && <Separator />}
      <div className='flex flex-col gap-2'>
        {data.production_companies.map((i: any) => (
          <Badge
            key={i.id}
            className='w-fit rounded-md bg-zinc-950 px-1 text-sm text-white hover:bg-zinc-900'
          >
            {i.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function getCertificationByCountry(data: any, isoCode: string) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const result = data.filter((i: any) => i.iso_3166_1 === isoCode);
  return result.length > 0 ? result[0].rating : null;
}
