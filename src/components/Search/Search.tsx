import { TV, fetchMoviesName, fetchTVName } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import SearchCard from './SearchCard';
import GridWrapper from '../PortraitCard/GridWrapper';

export default async function Search({ query }: { query: string }) {
  const movie = await fetchMoviesName(query);
  const tv = await fetchTVName(query);
  return (
    <div className='mx-auto w-[380px] md:w-[800px]'>
      <Tabs defaultValue='movie'>
        <TabsList className='w-full'>
          <TabsTrigger className='w-1/2' value='movie'>
            Movie
          </TabsTrigger>

          <TabsTrigger className='w-1/2' value='tv'>
            TV
          </TabsTrigger>
        </TabsList>

        <TabsContent value='movie'>
          <GridWrapper>
            {movie.map((data) => (
              <SearchCard key={data.id} data={data} />
            ))}
          </GridWrapper>
        </TabsContent>
        <TabsContent value='tv'>
          <GridWrapper>
            {tv.map((data: TV) => (
              <SearchCard key={data.id} data={data} />
            ))}
          </GridWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}
