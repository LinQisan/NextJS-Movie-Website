'use client';

import React from 'react';

export default function SeasonSelect({ data }: { data: any }) {
  const [selectSeason, setSelectSeason] = React.useState('1');
  const [selectEpisode, setSelectEpisode] = React.useState('1');
  const Season = data.seasonData.filter(
    (i: any) => i.season_number === Number(selectSeason),
  )[0].episodes;
  const Episode = Season.filter(
    (i: any) => i.episode_number === Number(selectEpisode),
  )[0];

  return (
    <div className='w-[380px] text-justify font-light md:w-[600px]'>
      <div className='flex gap-2'>
        <select
          name='TV Season'
          defaultValue={1}
          onChange={(e) => setSelectSeason(e.target.value)}
          className='h-8 rounded-sm bg-slate-100 font-normal text-slate-600 hover:bg-gray-200 hover:text-black'
        >
          {data.seasons.map((i: any) => (
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
          {Season.map((i: any) => (
            <option key={i.id} value={i.episode_number}>
              EP{String(i.episode_number).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>
      <h3 className='text-xl font-semibold'>{Episode.name}</h3>
      <div className='flex flex-col items-start justify-center'>
        <div className='flex gap-2'>
          <p>{Episode.air_date}</p>
          {Episode.runtime && <p>{Episode.runtime}min</p>}
        </div>
      </div>

      <p className='text-justify text-sm font-normal text-gray-500'>
        {Episode.overview}
      </p>
    </div>
  );
}
