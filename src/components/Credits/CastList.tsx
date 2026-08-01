'use client';

import ImageHolder from '../ui/ImageHolder';
import { useI18n } from '../I18nProvider';
import { StarLogo } from './StarLogo';

type BaseCast = {
  id: number;
  name: string;
  profile_path?: string | null;
  known_for_department: string;
};

type TVCast = BaseCast & {
  roles: { character: string }[];
};

type MovieCast = BaseCast & {
  credit_id: string;
  character: string;
};

export default function CastList({
  data,
  media,
}: {
  data: TVCast[] | MovieCast[];
  media: 'tv' | 'movie';
}) {
  const { t } = useI18n();

  return data.map((castMember, index) => {
    const character =
      media === 'tv'
        ? (castMember as TVCast).roles[0]?.character
        : (castMember as MovieCast).character;
    const creditKey =
      media === 'movie' ? (castMember as MovieCast).credit_id : castMember.id;

    return (
      <CastCard
        key={`${creditKey}-${index}`}
        name={castMember.name}
        profile_path={castMember.profile_path}
        character={character}
        profileAlt={t('media.profileAlt', { name: castMember.name })}
      />
    );
  });
}

function CastCard({
  name,
  character,
  profile_path,
  profileAlt,
}: {
  name: string;
  character?: string;
  profile_path?: string | null;
  profileAlt: string;
}) {
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
          className='mt-1 truncate text-xs text-zinc-500'
          title={character || undefined}
        >
          {character || '—'}
        </p>
      </div>
    </article>
  );
}
