import { LandscapeCardMap } from '@/components/MediaCard/LandscapeCardMap';

import { Carousel } from '@/components/Carousel/Carousel';
import { CarouselCardMap } from '@/components/Carousel/CarouselCardMap';

export default async function Home() {
  return (
    <div className='flex flex-col gap-6'>
      <Carousel>
        <CarouselCardMap />
      </Carousel>
      <div className='grid grid-cols-1 gap-4 place-self-center md:grid-cols-2'>
        <LandscapeCardMap count={6} />
      </div>
    </div>
  );
}
