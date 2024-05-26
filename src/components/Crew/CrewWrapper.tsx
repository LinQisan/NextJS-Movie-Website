'use client';
import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import Autoplay from 'embla-carousel-autoplay';

export default function CrewWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [emblaRef] = useEmblaCarousel({ axis: 'y', loop: true }, [
    AutoScroll({
      stopOnMouseEnter: true,
      stopOnInteraction: false,
      speed: 0.3,
      startDelay: 0.2,
    }),
  ]);
  return (
    <div className='overflow-hidden' ref={emblaRef}>
      <div className='flex h-48 flex-col pt-4'>{children}</div>
    </div>
  );
}
