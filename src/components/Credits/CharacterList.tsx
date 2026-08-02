'use client';

import ImageHolder from '../ui/ImageHolder';
import { useI18n } from '../I18nProvider';
import { StarLogo } from './StarLogo';

import type {
  BangumiCharacter,
  BangumiCharacterActor,
} from '@/lib/bangumi-types';

type TMDBCastMember = {
  id: number;
  name: string;
  original_name?: string;
  profile_path?: string | null;
  character?: string;
  roles?: { character: string }[];
};

export default function CharacterList({
  data,
  tmdbCast = [],
}: {
  data: BangumiCharacter[];
  tmdbCast?: TMDBCastMember[];
}) {
  const { t } = useI18n();

  return data.map((character) => {
    const voiceActors = resolveVoiceActors(character, tmdbCast);
    const actorNames = voiceActors.map((actor) => actor.name).join(' / ');

    return (
      <article
        key={`bangumi-character-${character.id}`}
        className='group min-w-0 border-b border-zinc-200/70 py-3 transition-colors last:border-b-0 hover:border-slate-400'
      >
        <div className='flex min-w-0 items-center gap-3'>
          <div className='flex shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-inset ring-zinc-200/80'>
            <div className='flex h-20 w-14 items-center justify-center overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200/70 sm:h-24 sm:w-16'>
              {character.image ? (
                <ImageHolder
                  src={character.image}
                  alt={t('media.characterAlt', { name: character.name })}
                  width={112}
                  height={160}
                  fit='contain'
                />
              ) : (
                <StarLogo />
              )}
            </div>
            {voiceActors.map((actor, index) => (
              <div
                key={`bangumi-character-${character.id}-actor-${actor.id}-${index}`}
                className='flex h-20 w-14 items-center justify-center overflow-hidden border-l border-white/70 bg-slate-100 sm:h-24 sm:w-16'
              >
                {actor.image ? (
                  <ImageHolder
                    src={actor.image}
                    alt={t('media.profileAlt', { name: actor.name })}
                    width={112}
                    height={160}
                  />
                ) : (
                  <StarLogo />
                )}
              </div>
            ))}
          </div>

          <div className='min-w-0 flex-1'>
            <h3
              className='truncate text-sm font-semibold text-zinc-900'
              title={character.name}
            >
              {character.name}
            </h3>
            <p
              className='mt-1 truncate text-xs text-zinc-500'
              title={character.relation || undefined}
            >
              {character.relation || '—'}
            </p>
            <p
              className='mt-2 break-words text-xs font-medium leading-5 text-zinc-700'
              title={actorNames || undefined}
            >
              <span className='mr-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400'>
                CV
              </span>
              {actorNames || '—'}
            </p>
          </div>
        </div>
      </article>
    );
  });
}

function resolveVoiceActors(
  character: BangumiCharacter,
  tmdbCast: TMDBCastMember[],
) {
  const bangumiActors = character.actors?.length
    ? character.actors
    : character.actor
      ? [character.actor]
      : [];
  const roleMatch = findTMDBRoleMatch(character, tmdbCast);
  const resolved = bangumiActors.map((actor, index) => {
    const matchedActor = findTMDBPersonMatch(actor, tmdbCast);
    const matched = matchedActor ?? (index === 0 ? roleMatch : undefined);

    return {
      id: actor.id,
      name: matched?.name || actor.name,
      image: matched?.profile_path
        ? `https://media.themoviedb.org/t/p/w276_and_h350_face${matched.profile_path}`
        : actor.image,
    };
  });

  if (resolved.length > 0) return resolved;
  if (!roleMatch) return [];
  return [
    {
      id: roleMatch.id,
      name: roleMatch.name,
      image: roleMatch.profile_path
        ? `https://media.themoviedb.org/t/p/w276_and_h350_face${roleMatch.profile_path}`
        : undefined,
    },
  ];
}

function findTMDBPersonMatch(
  actor: BangumiCharacterActor,
  tmdbCast: TMDBCastMember[],
) {
  const actorName = normalizeName(actor.name);
  if (!actorName) return undefined;

  return tmdbCast.find((castMember) => {
    const personNames = [castMember.name, castMember.original_name]
      .map(normalizeName)
      .filter(Boolean);
    return personNames.some((name) => name === actorName);
  });
}

function findTMDBRoleMatch(
  character: BangumiCharacter,
  tmdbCast: TMDBCastMember[],
) {
  const characterName = normalizeName(character.name);
  if (!characterName) return undefined;

  return tmdbCast.find((castMember) => {
    const roleNames = [
      castMember.character,
      ...(castMember.roles ?? []).map((role) => role.character),
    ]
      .map(normalizeName)
      .filter(Boolean);
    return roleNames.some((name) => name === characterName);
  });
}

function normalizeName(value: string | undefined) {
  return (
    value
      ?.normalize('NFKC')
      .toLocaleLowerCase()
      .replace(/\p{M}/gu, '')
      .replace(/[^\p{L}\p{N}]+/gu, '') ?? ''
  );
}
