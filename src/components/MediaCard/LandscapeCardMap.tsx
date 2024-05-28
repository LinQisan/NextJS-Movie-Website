import { getTrending } from '@/lib/data';
import MediaCard from './MediaCard';

interface data {
  id: number;
  name: string;
  backdrop_path: string;
}
export async function LandscapeCardMap({ count }: { count?: number }) {
  let data: data[] = await getTrending('tv');
  if (count) {
    data = data.slice(0, count);
  }
  return data.map(({ id, name, backdrop_path }) => {
    return (
      <MediaCard
        imgUrl={`https://image.tmdb.org/t/p/original${backdrop_path}`}
        name={name}
        key={id}
        id={id}
      />
    );
  });
}
