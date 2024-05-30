import Image from 'next/image';

import { StarLogo } from './StarLogo';
import { Badge } from '../ui/badge';
import { YCarousel } from '../Carousel/YCarousel';

type BaseCrew = {
  id: number;
  name: string;
  profile_path?: string;
};

type MovieCrew = BaseCrew & {
  job: string;
};

type TVCrew = BaseCrew & {
  jobs: {
    credit_id: string;
    job: string;
  }[];
};

type CrewProps = {
  name: string;
  profile_path?: string;
  jobs:
    | {
        credit_id: string;
        job: string;
      }[]
    | string;
};

export default function CrewList({
  data,
  media,
}: {
  data: MovieCrew[] | TVCrew[];
  media: 'tv' | 'movie';
}) {
  return data.map((crewMember) => {
    if (media === 'movie') {
      const movieCastMember = crewMember as MovieCrew;
      return (
        <Crew
          key={movieCastMember.id}
          name={movieCastMember.name}
          profile_path={movieCastMember.profile_path}
          jobs={movieCastMember.job}
        />
      );
    } else {
      const tvCastMember = crewMember as TVCrew;
      return (
        <Crew
          key={tvCastMember.id}
          name={tvCastMember.name}
          profile_path={tvCastMember.profile_path}
          jobs={tvCastMember.jobs}
        />
      );
    }
  });
}

function Crew({ name, profile_path, jobs }: CrewProps) {
  return (
    <div className='flex gap-2 pl-2'>
      <div className='flex aspect-[2/3] h-[80px] w-[70px] items-center justify-center overflow-hidden rounded-lg border-2'>
        {profile_path ? (
          <Image
            src={`https://media.themoviedb.org/t/p/w276_and_h350_face${profile_path}`}
            alt={`${name}'s Photos`}
            width={70}
            height={70}
            className='object-cover'
          />
        ) : (
          <StarLogo />
        )}
      </div>
      <div>
        {typeof jobs === 'string' ? (
          <Badge className='mt-2 w-fit select-none text-clip text-nowrap rounded-md bg-zinc-950 px-1 py-0 text-center font-mono text-xs font-light text-white hover:bg-zinc-900'>
            {jobs}
          </Badge>
        ) : (
          <YCarousel>
            {jobs.map((i: any) => (
              <div key={i.credit_id} className='min-w-0 flex-none'>
                <Badge className='mt-2 w-fit select-none text-clip text-nowrap rounded-md bg-zinc-950 px-1 py-0 text-center font-mono text-xs font-light text-white hover:bg-zinc-900'>
                  {i.job}
                </Badge>
              </div>
            ))}
          </YCarousel>
        )}
        <h2 className='truncate'>{name}</h2>
      </div>
    </div>
  );
}
