import { Suspense } from 'react';
import { Metadata } from 'next';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import ImageHolder from '@/components/ui/ImageHolder';
import Credits from '@/components/Credits/Credits';

import { cn } from '@/lib/utils';
import { getMovieDetails } from '@/lib/data';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await getMovieDetails(params.id);

  return {
    title: data.title,
    openGraph: {
      title: data.title,
      description: data.overview.slice(0, 5),
      images: [`https://image.tmdb.org/t/p/original${data.backdrop_path}`],
    },
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getMovieDetails(params.id);

  return (
    <div className='mx-auto flex max-w-fit flex-col justify-center gap-2 '>
      {data.backdrop_path && (
        <div className='relative max-w-fit'>
          <div className='aspect-video w-[380px] select-none overflow-hidden rounded-lg shadow-md md:w-[600px]'>
            <ImageHolder
              src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
              alt={`${data.title}'s backdrop`}
              width={600}
              height={300}
              overrideSrc={`/${data.title}`}
              priority={true}
            />
          </div>
          <div className='absolute bottom-0 left-0 w-full rounded p-2 text-white backdrop-blur-md backdrop-brightness-50 backdrop-filter'>
            <h2 className='font-semibold'>{data.original_title}</h2>
            <p className='text-sm'>{data.tagline}</p>
          </div>
        </div>
      )}
      <div className='flex flex-col gap-2 text-left'>
        <h2 className='w-[380px] text-justify text-4xl font-semibold md:w-[600px]'>
          {data.title}
        </h2>
        <div className='flex gap-2'>
          <p>{data.release_date}</p>
          <span>{data.runtime}min</span>
          <Badge
            variant='secondary'
            className={cn(
              'w-fit select-none rounded-md bg-zinc-950 px-1 font-mono text-xs font-light text-white hover:bg-zinc-900',
              {
                hidden: !getCertificationByCountry(data, 'US'),
              },
            )}
          >
            {getCertificationByCountry(data, 'US')}
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
        <Credits id={params.id} media='movie' />
      </Suspense>

      <Separator />
      <div className='flex justify-between'>
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

        <div className='self-end text-left'>
          <p className={cn('font-mono text-sm', { hidden: !data.revenue })}>
            Revenue:{' '}
            {data.revenue?.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          {data.revenue && data.budget && (
            <p className={'font-mono text-sm'}>
              Revenue/Budget: {((data.revenue / data.budget) * 100).toFixed(0)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function getCertificationByCountry(data: any, isoCode: string) {
  if (data && data.release_dates && data.release_dates.results) {
    for (const result of data.release_dates.results) {
      if (result.iso_3166_1 === isoCode) {
        if (result.release_dates && result.release_dates.length > 0) {
          return result.release_dates[0].certification;
        }
      }
    }
  }
  return null;
}
