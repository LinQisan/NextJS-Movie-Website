'use client';

import ImageHolder from '../ui/ImageHolder';
import { useI18n } from '../I18nProvider';
import { StarLogo } from './StarLogo';

type BaseCrew = {
  id: number;
  name: string;
  profile_path?: string | null;
};

type MovieCrew = BaseCrew & {
  credit_id: string;
  job: string;
};

type TVCrew = BaseCrew & {
  jobs: {
    credit_id: string;
    job: string;
  }[];
};

export default function CrewList({
  data,
  media,
}: {
  data: MovieCrew[] | TVCrew[];
  media: 'tv' | 'movie';
}) {
  const { t } = useI18n();

  return data.map((crewMember, index) => {
    const jobs =
      media === 'tv'
        ? (crewMember as TVCrew).jobs.map((item) => item.job)
        : [(crewMember as MovieCrew).job];
    const creditKey =
      media === 'movie' ? (crewMember as MovieCrew).credit_id : crewMember.id;

    return (
      <CrewCard
        key={`${creditKey}-${index}`}
        name={crewMember.name}
        profile_path={crewMember.profile_path}
        jobs={[...new Set(jobs.filter(Boolean))]}
        profileAlt={t('media.profileAlt', { name: crewMember.name })}
      />
    );
  });
}

function CrewCard({
  name,
  profile_path,
  jobs,
  profileAlt,
}: {
  name: string;
  profile_path?: string | null;
  jobs: string[];
  profileAlt: string;
}) {
  const jobLabel = jobs.join(' · ');

  return (
    <article className='group flex min-w-0 items-center gap-3 border-b border-zinc-200/70 py-3.5 transition-colors last:border-b-0 hover:border-slate-400'>
      <div className='flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-zinc-200/80'>
        {profile_path ? (
          <ImageHolder
            src={`https://media.themoviedb.org/t/p/w276_and_h350_face${profile_path}`}
            alt={profileAlt}
            width={60}
            height={60}
          />
        ) : (
          <StarLogo />
        )}
      </div>
      <div className='min-w-0'>
        <h3
          className='truncate text-sm font-semibold text-zinc-900'
          title={name}
        >
          {name}
        </h3>
        <p
          className='mt-1 line-clamp-2 text-xs leading-4 text-zinc-500'
          title={jobLabel || undefined}
        >
          {jobLabel || '—'}
        </p>
      </div>
    </article>
  );
}
