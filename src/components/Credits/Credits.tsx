import { I18nText } from '@/components/I18nProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { getMovieDetails, getTVCredits, type MovieCredits } from '@/lib/data';

import CastList from './CastList';
import CrewList from './CrewList';

export default async function Credits({
  id,
  media,
  credits,
}: {
  id: string;
  media: 'tv' | 'movie';
  credits?: MovieCredits;
}) {
  let data;
  if (media === 'tv') {
    data = await getTVCredits(id);
  } else {
    data = credits ?? (await getMovieDetails(id)).credits;
  }

  return (
    <section
      className='border-t border-zinc-200/80 pt-8'
      aria-labelledby='credits-heading'
    >
      <Tabs defaultValue='cast' className='w-full'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2
            id='credits-heading'
            className='text-lg font-semibold tracking-[-0.02em] text-zinc-950'
          >
            <I18nText messageKey='detail.credits' />
          </h2>
          <TabsList className='h-8 gap-1 rounded-none bg-transparent p-0'>
            <TabsTrigger
              className='h-8 rounded-none border-b-2 border-transparent px-2.5 py-1 text-xs text-zinc-500 data-[state=active]:border-zinc-950 data-[state=active]:bg-transparent data-[state=active]:text-zinc-950 data-[state=active]:shadow-none'
              value='cast'
            >
              <I18nText messageKey='detail.cast' />
            </TabsTrigger>
            <TabsTrigger
              className='h-8 rounded-none border-b-2 border-transparent px-2.5 py-1 text-xs text-zinc-500 data-[state=active]:border-zinc-950 data-[state=active]:bg-transparent data-[state=active]:text-zinc-950 data-[state=active]:shadow-none'
              value='crew'
            >
              <I18nText messageKey='detail.crew' />
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='cast'>
          <CreditPanel>
            <CastList data={data.cast} media={media} />
          </CreditPanel>
        </TabsContent>
        <TabsContent value='crew'>
          <CreditPanel>
            <CrewList data={data.crew} media={media} />
          </CreditPanel>
        </TabsContent>
      </Tabs>
    </section>
  );
}

function CreditPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className='mt-4 grid max-h-[500px] grid-cols-1 gap-x-8 overflow-y-auto sm:grid-cols-2'>
      {children}
    </div>
  );
}
