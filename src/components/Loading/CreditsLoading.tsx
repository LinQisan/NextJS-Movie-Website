import { I18nText } from '../I18nProvider';
import { Skeleton } from '../ui/skeleton';

export default function CreditsLoading() {
  return (
    <section className='border-t border-zinc-200/80 pt-8' aria-hidden='true'>
      <div className='credits-tabs-list flex w-fit items-center gap-1 border-b border-zinc-200/70'>
        <div className='relative px-2.5 py-2 text-xs font-medium text-zinc-950'>
          <I18nText messageKey='detail.cast' />
          <span
            className='absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-[var(--theme-accent)]'
            aria-hidden='true'
          />
        </div>
        <div className='px-2.5 py-2 text-xs font-medium text-zinc-500'>
          <I18nText messageKey='detail.crew' />
        </div>
      </div>
      <CreditSkeletonPanel />
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
