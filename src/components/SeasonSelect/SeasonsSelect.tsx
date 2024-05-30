'use client';
import { season } from '@/lib/data';
import React from 'react';

type Episode = {
  air_date: string;
  episode_number: number;
  id: number;
  name: string;
  overview: string;
  runtime: number;
  season_number: number;
};

export default function SeasonsSelect({
  id,
  seasons,
}: {
  id: string;
  seasons: season[];
}) {
  const [selectSeason, setSelectSeason] = React.useState('1');
  const [selectEpisode, setSelectEpisode] = React.useState('1');
  const [episodes, setEpisodes] = React.useState<Episode[]>();

  const episode_count =
    seasons.find((i) => i.season_number === Number(selectSeason))
      ?.episode_count || 1;

  React.useEffect(() => {
    const fetchData = async (id: string) => {
      try {
        const res = await fetch(`/api/${id}?season=${selectSeason}`);
        const json = await res.json();
        const { episodes }: { episodes: Episode[] } = json.data;

        setEpisodes(episodes);
      } catch (err) {
        throw new Error('Fail Get to Data');
      }
    };
    fetchData(id);
  }, [selectSeason, id]);

  const episode = episodes?.find(
    (i) => i.episode_number === Number(selectEpisode),
  );

  return (
    <div className='w-[380px] text-justify font-light md:w-[600px]'>
      <div className='flex gap-2'>
        <input type='hidden' name='season' value={selectSeason} />
        <select
          name='TV Season'
          defaultValue={1}
          onChange={(e) => setSelectSeason(e.target.value)}
          className='h-8 rounded-sm bg-slate-100 font-normal text-slate-600 hover:bg-gray-200 hover:text-black'
        >
          {seasons.map((i) => (
            <option key={i.id} value={i.season_number}>
              {i.name}
            </option>
          ))}
        </select>

        <select
          name='TV Eposide'
          defaultValue={1}
          onChange={(e) => setSelectEpisode(e.target.value)}
          className='h-8 rounded-sm bg-slate-100 font-normal text-slate-600 hover:bg-gray-200 hover:text-black'
        >
          {Array.from({ length: episode_count }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              EP {String(i + 1).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
      <h3 className='text-xl font-semibold'>{episode?.name}</h3>
      <div className='flex flex-col items-start justify-center'>
        <div className='flex gap-2'>
          <p>{episode?.air_date}</p>
          {episode?.runtime && <p>{episode?.runtime}min</p>}
        </div>
      </div>

      <p className='text-justify text-sm font-normal text-gray-500'>
        {episode?.overview}
      </p>
    </div>
  );
}
