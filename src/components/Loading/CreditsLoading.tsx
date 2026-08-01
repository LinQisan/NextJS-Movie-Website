import { I18nText } from '../I18nProvider';
import { Skeleton } from '../ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function CreditsLoading() {
  return (
    <section aria-hidden='true'>
      <Tabs defaultValue='cast' className='w-full'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <h2 className='text-lg font-semibold text-zinc-950'>
            <I18nText messageKey='detail.credits' />
          </h2>
          <TabsList className='h-8 gap-1 rounded-none bg-transparent p-0'>
            <TabsTrigger
              className='h-8 rounded-none border-b-2 border-transparent px-2.5 py-1 text-xs data-[state=active]:border-zinc-950 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
              value='cast'
            >
              <I18nText messageKey='detail.cast' />
            </TabsTrigger>
            <TabsTrigger
              className='h-8 rounded-none border-b-2 border-transparent px-2.5 py-1 text-xs data-[state=active]:border-zinc-950 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
              value='crew'
            >
              <I18nText messageKey='detail.crew' />
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value='cast'>
          <CreditSkeletonPanel />
        </TabsContent>
        <TabsContent value='crew'>
          <CreditSkeletonPanel />
        </TabsContent>
      </Tabs>
    </section>
  );
}

function CreditSkeletonPanel() {
  return (
    <div className='mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2'>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className='flex items-center gap-3 border-b border-zinc-200/70 py-3.5'
        >
          <Skeleton className='size-12 shrink-0 rounded-full' />
          <div className='flex min-w-0 flex-1 flex-col gap-2'>
            <Skeleton className='h-3 w-3/5' />
            <Skeleton className='h-2.5 w-4/5' />
          </div>
        </div>
      ))}
    </div>
  );
}
