import { getTrending } from '@/lib/data';
import { Reveal } from '../Motion/Reveal';
import CarouselCard from './CarouselCard';

export async function CarouselCardMap() {
  const data = await getTrending('movie');
  return data
    .filter((movie) => movie.poster_path)
    .map(({ id, title, poster_path, release_date }, index) => {
      const year = new Date(release_date).getFullYear();
      return (
        <Reveal
          key={id}
          className='min-w-0 flex-[0_0_50%] pl-2 sm:flex-[0_0_33.333333%] sm:pl-3 md:flex-[0_0_25%] lg:flex-[0_0_20%] lg:pl-4'
          delay={Math.min(index, 6) * 0.04}
        >
          <CarouselCard
            imgUrl={`https://media.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path!}`}
            name={title}
            year={year}
            id={id}
          />
        </Reveal>
      );
    });
}
