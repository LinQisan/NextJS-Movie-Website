import Image from 'next/image';

import { StarLogo } from './StarLogo';
import { Badge } from '../ui/badge';
import { YCarousel } from '../Carousel/YCarousel';
import ImageHolder from '../ui/ImageHolder';

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
    const job =
      media === 'tv'
        ? (crewMember as TVCrew).jobs
        : (crewMember as MovieCrew).job;

    return (
      <Crew
        key={crewMember.id}
        name={crewMember.name}
        profile_path={crewMember.profile_path}
        jobs={job}
      />
    );
  });
}

function Crew({ name, profile_path, jobs }: CrewProps) {
  return (
    <div className='flex gap-2 pl-2'>
      <div className='flex aspect-[2/3] h-[80px] w-[70px] items-center justify-center overflow-hidden rounded-lg border-2'>
        {profile_path ? (
          <ImageHolder
            src={`https://media.themoviedb.org/t/p/w276_and_h350_face${profile_path}`}
            alt={`${name}'s Photos`}
            width={70}
            height={70}
          overrideSrc={`/${name}`}
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
