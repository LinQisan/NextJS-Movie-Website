'use client';
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

export function YCarousel({ children }: { children: React.ReactNode }) {
  const [emblaRef] = useEmblaCarousel({ loop: true, axis: 'y' }, [
    AutoScroll({
      stopOnMouseEnter: false,
      stopOnInteraction: false,
      speed: 0.1,
      startDelay: 0,
    }),
  ]);

  return (
    <div className='w-fit overflow-hidden' ref={emblaRef}>
      <div className='flex h-[25px] flex-col'>{children}</div>
    </div>
  );
}
