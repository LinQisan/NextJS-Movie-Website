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
    <div
      className='mx-auto max-w-[360px] overflow-hidden md:max-w-[700px]'
      ref={emblaRef}
    >
      <div className='flex'>{children}</div>
    </div>
  );
}
