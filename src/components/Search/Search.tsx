import { TV, fetchMoviesName, fetchTVName } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import SearchCard from './SearchCard';
import GridWrapper from '../ui/GridWrapper';
import { I18nText } from '../I18nProvider';

export default async function Search({ query }: { query: string }) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return (
      <div className='mx-auto flex min-h-64 w-full max-w-[800px] items-center justify-center px-4 text-center text-gray-500'>
        <I18nText messageKey='search.minimum' />
      </div>
    );
  }

  const [movie, tv] = await Promise.all([
    fetchMoviesName(normalizedQuery),
    fetchTVName(normalizedQuery),
  ]);
  return (
    <div className='mx-auto w-full max-w-[800px]'>
      <Tabs defaultValue='movie'>
        <TabsList className='w-full'>
          <TabsTrigger className='w-1/2' value='movie'>
            <I18nText messageKey='search.movies' />
          </TabsTrigger>

          <TabsTrigger className='w-1/2' value='tv'>
            <I18nText messageKey='search.tv' />
          </TabsTrigger>
        </TabsList>

        <TabsContent value='movie'>
          <GridWrapper>
            {movie.map((data) => (
              <SearchCard key={data.id} data={data} />
            ))}
            {movie.length === 0 && <EmptyResult media='movie' />}
          </GridWrapper>
        </TabsContent>
        <TabsContent value='tv'>
          <GridWrapper>
            {tv.map((data: TV) => (
              <SearchCard key={data.id} data={data} />
            ))}
            {tv.length === 0 && <EmptyResult media='tv' />}
          </GridWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyResult({ media }: { media: 'movie' | 'tv' }) {
  return (
    <p className='col-span-full py-12 text-center text-gray-500'>
      <I18nText
        messageKey={media === 'movie' ? 'search.emptyMovies' : 'search.emptyTv'}
      />
    </p>
  );
}
