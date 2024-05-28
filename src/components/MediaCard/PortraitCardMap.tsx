import { getTrending } from '@/lib/data';
import MediaCard from './MediaCard';

interface data {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}
export async function PortraitCardMap() {
  const data: data[] = await getTrending('movie');
  return data.map(({ id, title, poster_path, release_date }) => {
    const year = new Date(release_date).getFullYear();
    return (
      //
      <MediaCard
        imgUrl={`https://media.themoviedb.org/t/p/w600_and_h900_bestv2${poster_path}`}
        name={title}
        key={id}
        year={year}
        id={id}
        movie={true}
      />
    );
  });
}
