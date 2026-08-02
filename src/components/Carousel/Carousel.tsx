'use client';
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';

export function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: false,
  });

  return (
    <div className='w-full touch-pan-y overflow-hidden py-1' ref={emblaRef}>
      <div className='-ml-2 flex sm:-ml-3 lg:-ml-4'>{children}</div>
    </div>
  );
}
