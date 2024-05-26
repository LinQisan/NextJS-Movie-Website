import { fetchTrendingMovie } from '@/lib/data';
import PortraitCard from './PortraitCard';

interface data {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}
export async function PortaitCardMap() {
  const data: data[] = await fetchTrendingMovie();
  return data.map(({ id, title, poster_path, release_date }) => {
    const year = new Date(release_date).getFullYear();
    return (
      //
      <PortraitCard
        imgUrl={`https://media.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`}
        name={title}
        key={id}
        year={year}
        id={id}
      />
    );
  });
}
