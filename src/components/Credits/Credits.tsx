import { I18nText } from '@/components/I18nProvider';

import type { BangumiCharacter } from '@/lib/bangumi-types';
import { getMovieDetails, getTVCredits, type MovieCredits } from '@/lib/data';

import CastList from './CastList';
import CharacterList from './CharacterList';
import CrewList from './CrewList';
import CreditsTabs, { type CreditsPanel, type CreditsTab } from './CreditsTabs';

export default async function Credits({
  id,
  media,
  credits,
  bangumiCharacters,
}: {
  id: string;
  media: 'tv' | 'movie';
  credits?: MovieCredits;
  bangumiCharacters?: BangumiCharacter[];
}) {
  const data =
    media === 'tv'
      ? await getTVCredits(id)
      : credits ?? (await getMovieDetails(id)).credits;
  const hasCharacters = Boolean(bangumiCharacters?.length);
  const tabs: CreditsTab[] = [
    ...(hasCharacters
      ? [{ value: 'characters', label: 'detail.characters' as const }]
      : []),
    {
      value: 'cast',
      label: hasCharacters ? ('detail.voiceCast' as const) : 'detail.cast',
    },
    { value: 'crew', label: 'detail.crew' },
  ];
  const panels: CreditsPanel[] = [
    ...(hasCharacters
      ? [
          {
            value: 'characters',
            content: (
              <CreditPanel>
                <CharacterList
                  data={bangumiCharacters ?? []}
                  tmdbCast={data.cast}
                />
              </CreditPanel>
            ),
          },
        ]
      : []),
    {
      value: 'cast',
      content: (
        <CreditPanel>
          <CastList data={data.cast} media={media} />
        </CreditPanel>
      ),
    },
    {
      value: 'crew',
      content: (
        <CreditPanel>
          <CrewList data={data.crew} media={media} />
        </CreditPanel>
      ),
    },
  ];

  return (
    <section
      className='border-t border-zinc-200/80 pt-8'
      aria-labelledby='credits-heading'
    >
      <h2 id='credits-heading' className='sr-only'>
        <I18nText
          messageKey={
            hasCharacters ? 'detail.charactersAndCredits' : 'detail.credits'
          }
        />
      </h2>
      <CreditsTabs
        defaultValue={hasCharacters ? 'characters' : 'cast'}
        tabs={tabs}
        panels={panels}
      />
    </section>
  );
}

function CreditPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className='mt-4 grid max-h-[500px] grid-cols-1 gap-x-8 overflow-y-auto sm:grid-cols-2'>
      {children}
    </div>
  );
}
