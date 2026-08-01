'use client';

import { useEffect } from 'react';
import { I18nText } from '@/components/I18nProvider';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className='mx-auto flex min-h-64 max-w-lg flex-col items-center justify-center gap-4 text-center'>
      <h1 className='text-2xl font-semibold'>
        <I18nText messageKey='error.title' />
      </h1>
      <p className='text-sm text-gray-600'>
        <I18nText messageKey='error.description' />
      </p>
      <button
        type='button'
        onClick={reset}
        className='rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2'
      >
        <I18nText messageKey='error.reload' />
      </button>
    </main>
  );
}
