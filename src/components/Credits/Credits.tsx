import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import CastList from './CastList';
import CrewList from './CrewList';

import { getMovieDetails, getTVCredits } from '@/lib/data';

export default async function Credits({
  id,
  media,
}: {
  id: string;
  media: 'tv' | 'movie';
}) {
  let data;
  if (media === 'tv') {
    data = await getTVCredits(id);
  } else {
    const movieDetails = await getMovieDetails(id);
    data = movieDetails.credits;
  }

  return (
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
            <CastList data={data.cast} media={media} />
          </div>
        </Card>
      </TabsContent>
      <TabsContent value='crew'>
        <Card className='w-full '>
          <div
            className='flex h-64 w-[380px] flex-col gap-4 
      overflow-y-auto           
      scroll-smooth md:w-[600px]'
          >
            <CrewList data={data.crew} media={media} />
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
