import { fetchTrendingTV } from '@/lib/data';
import LandscapeCard from './LandscapeCard';

interface data {
  id: number;
  name: string;
  backdrop_path: string;
  first_air_date: string;
}
export async function LandscapeCardMap() {
  const data: data[] = await fetchTrendingTV();
  return data.map(({ id, name, backdrop_path, first_air_date }) => {
    const date = first_air_date.replaceAll('-', '.');
    return (
      <LandscapeCard
        imgUrl={`https://image.tmdb.org/t/p/original${backdrop_path}`}
        name={name}
        key={id}
        airDate={date}
        id={id}
      />
    );
  });
}
