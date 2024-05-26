import { fetchTrendingMovie } from '@/lib/data';
import CarouselCard from './CarouselCard';

interface data {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}
export async function CarouselCardMap() {
  const data: data[] = await fetchTrendingMovie();
  return data.map(({ id, title, poster_path, release_date }) => {
    const year = new Date(release_date).getFullYear();
    return (
      <div key={id} className='min-w-0 flex-none pl-4'>
        <CarouselCard
          imgUrl={`https://media.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`}
          name={title}
          year={year}
          id={id}
        />
      </div>
    );
  });
}
