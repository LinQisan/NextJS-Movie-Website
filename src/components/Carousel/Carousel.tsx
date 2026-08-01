'use client';
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';

export function Carousel({ children }: { children: React.ReactNode }) {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [
    AutoScroll({
      stopOnMouseEnter: true,
      stopOnInteraction: false,
      speed: 0.3,
      startDelay: 0.2,
    }),
  ]);

  return (
    <div className='w-full overflow-hidden py-1' ref={emblaRef}>
      <div className='-ml-3 flex sm:-ml-4'>{children}</div>
    </div>
  );
}
