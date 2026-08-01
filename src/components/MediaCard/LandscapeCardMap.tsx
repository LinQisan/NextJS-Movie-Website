import { getTrending } from '@/lib/data';
import { Reveal } from '../Motion/Reveal';
import MediaCard from './MediaCard';

export async function LandscapeCardMap({ count }: { count?: number }) {
  let data = (await getTrending('tv')).filter((show) => show.backdrop_path);
  if (count) {
    data = data.slice(0, count);
  }
  return data.map(({ id, name, backdrop_path }, index) => {
    return (
      <Reveal key={id} className='w-full' delay={Math.min(index, 5) * 0.06}>
        <MediaCard
          imgUrl={`https://image.tmdb.org/t/p/original${backdrop_path!}`}
          name={name}
          id={id}
        />
      </Reveal>
    );
  });
}
