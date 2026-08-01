import { LandscapeCardMap } from '@/components/MediaCard/LandscapeCardMap';

import { Carousel } from '@/components/Carousel/Carousel';
import { CarouselCardMap } from '@/components/Carousel/CarouselCardMap';
import { I18nText } from '@/components/I18nProvider';
import { Reveal } from '@/components/Motion/Reveal';
import type { MessageKey } from '@/lib/i18n';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <main className='mx-auto flex w-full max-w-7xl flex-col gap-10'>
      <h1 className='sr-only'>
        <I18nText messageKey='home.srTitle' />
      </h1>
      <section className='flex flex-col gap-4 overflow-hidden'>
        <Reveal className='w-full'>
          <SectionHeader
            eyebrow='home.trendingEyebrow'
            title='home.trendingTitle'
            href='/film'
          />
        </Reveal>
        <Carousel>
          <CarouselCardMap />
        </Carousel>
      </section>

      <section className='flex flex-col gap-4'>
        <Reveal className='w-full' delay={0.06}>
          <SectionHeader
            eyebrow='home.seriesEyebrow'
            title='home.seriesTitle'
            href='/tv'
          />
        </Reveal>
        <div className='grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 lg:grid-cols-3'>
          <LandscapeCardMap count={6} />
        </div>
      </section>
    </main>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: MessageKey;
  title: MessageKey;
  href: string;
}) {
  return (
    <div className='flex items-end justify-between gap-4 border-b border-zinc-200 pb-3'>
      <div>
        <p className='font-mono text-[10px] font-semibold tracking-[0.2em] text-zinc-500 sm:text-xs'>
          <I18nText messageKey={eyebrow} />
        </p>
        <h2 className='mt-1 text-2xl font-bold tracking-tight sm:text-3xl'>
          <I18nText messageKey={title} />
        </h2>
      </div>
      <Link
        href={href}
        className='shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-semibold transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'
      >
        <I18nText messageKey='home.viewAll' />
      </Link>
    </div>
  );
}
