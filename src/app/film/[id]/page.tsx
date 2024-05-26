import Crew from '@/components/Crew/Crew';
import { fetchMovieDetails } from '@/lib/data';
import Image from 'next/image';

import Cast from '@/components/Cast/Cast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Card, CardTitle } from '@/components/ui/card';
import { getBase64 } from '@/lib/util';
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const data = await fetchMovieDetails(params.id);

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
  const data = await fetchMovieDetails(params.id);

  return (
    <div className='mx-auto flex max-w-fit flex-col justify-center gap-2 '>
      {data.backdrop_path && (
        <div className='relative max-w-fit'>
          <div className='aspect-video w-[380px] select-none overflow-hidden rounded-lg shadow-md md:w-[600px]'>
            <Image
              src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
              alt={`${data.title}'s backdrop`}
              width={600}
              height={300}
              className='object-cover'
              overrideSrc={`/${data.title}.jpg`}
              placeholder='blur'
              blurDataURL={await getBase64(
                `https://image.tmdb.org/t/p/original${data.backdrop_path}`,
              )}
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

      <Tabs defaultValue='cast'>
        <TabsList className='w-full'>
          <TabsTrigger className='w-1/2' value='cast'>
            Cast
          </TabsTrigger>
          <TabsTrigger className='w-1/2' value='crew'>
            Crew
          </TabsTrigger>
        </TabsList>
        <TabsContent value='cast'>
          <Card className='w-full '>
            <div
              className='flex h-64 w-[380px] flex-col gap-4 
            overflow-y-auto           
            scroll-smooth md:w-[600px]'
            >
              {data.credits.cast.map((i: any) => (
                <Cast
                  key={i.id}
                  department={i.known_for_department}
                  name={i.name}
                  profile_path={i.profile_path}
                  character={i.character}
                />
              ))}
            </div>
          </Card>
        </TabsContent>
        <TabsContent value='crew'>
          <Card className='w-full'>
            <div
              className='flex h-64 w-[380px] flex-col gap-4 
            overflow-y-auto           
            scroll-smooth md:w-[600px]'
            >
              {data.credits.crew.map((i: any) => (
                <Crew
                  key={i.id}
                  id={i.id}
                  name={i.name}
                  profile_path={i.profile_path}
                  job={i.job}
                />
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

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
            {data.revenue.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <p
            className={cn('font-mono text-sm', {
              hidden: !data.revenue || !data.budget,
            })}
          >
            Revenue/Budget: {((data.revenue / data.budget) * 100).toFixed(0)}%
          </p>
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
