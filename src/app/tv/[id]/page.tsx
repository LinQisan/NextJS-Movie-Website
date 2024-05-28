import SeasonSelect from '@/components/SeasonSelect/SeasonSelect';
import { Badge } from '@/components/ui/badge';
import { fetchTVDetails } from '@/lib/data';
import { getBase64 } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Crew from '@/components/Crew/Crew';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Cast from '@/components/Cast/Cast';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Metadata } from 'next';

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

function getCertificationByCountry(data: any, isoCode: string) {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const result = data.filter((i: any) => i.iso_3166_1 === isoCode);
  return result.length > 0 ? result[0].rating : null;
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
              {data.aggregate_credits.cast.map((i: any) => (
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
              {data.aggregate_credits.crew.map((i: any) => (
                <Crew
                  key={i.id}
                  id={i.id}
                  name={i.name}
                  profile_path={i.profile_path}
                  job={i.jobs}
                />
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
      <Separator />
      <SeasonSelect data={data}></SeasonSelect>
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
