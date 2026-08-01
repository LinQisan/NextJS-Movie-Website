'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as m from 'motion/react-m';
import { useI18n } from '../I18nProvider';

export default function NavSearch({
  handleSearching,
}: {
  handleSearching: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = React.useState(
    () => searchParams.get('query')?.toString() ?? '',
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedQuery = query.trim();
    const params = new URLSearchParams();

    if (normalizedQuery.length >= 2) {
      params.set('query', normalizedQuery);
    }

    const serializedParams = params.toString();
    replace(serializedParams ? `/search?${serializedParams}` : '/search');
  };

  return (
    <m.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className='relative grid w-[calc(100vw-3rem)] shrink-0 grid-cols-[minmax(0,1fr)_2rem] items-center gap-2 px-2 sm:w-[368px] sm:grid-cols-[minmax(0,1fr)_2.5rem]'
    >
      <button
        type='submit'
        aria-label={t('nav.submitSearch')}
        className='absolute inset-y-0 left-4 z-10 flex items-center text-zinc-500 transition-colors hover:text-zinc-800 focus-visible:rounded-full focus-visible:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400'
      >
        <SearchLogo />
      </button>

      <input
        id='search'
        name='movie'
        type='text'
        className='block h-8 min-w-0 cursor-text rounded-full border-2 border-zinc-300 bg-zinc-50 pl-10 pr-4 text-sm text-zinc-950 shadow-[inset_0_1px_2px_rgb(0_0_0_/_0.08)] outline-none transition-[background-color,border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-500 focus:bg-white focus:shadow-[inset_0_1px_2px_rgb(0_0_0_/_0.04)] md:h-11 md:text-base'
        placeholder={t('nav.searchPlaceholder')}
        aria-label={t('nav.searchPlaceholder')}
        enterKeyHint='search'
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button
        type='button'
        aria-label={t('nav.closeSearch')}
        className='nav-theme-muted mr-0.5 flex size-8 items-center justify-center rounded-full transition-[color,background-color,transform] hover:rotate-90 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:size-10'
        onClick={handleSearching}
      >
        <ReturnLogo />
      </button>
    </m.form>
  );
}

function SearchLogo() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={1.5}
      stroke='currentColor'
      className='size-5'
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
      />
    </svg>
  );
}

function ReturnLogo() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2.5}
      stroke='currentColor'
      className='size-5'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M6 18 18 6M6 6l12 12'
      />
    </svg>
  );
}
