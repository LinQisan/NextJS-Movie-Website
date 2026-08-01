import Link from 'next/link';
import { I18nText } from '@/components/I18nProvider';

export default function NotFound() {
  return (
    <main className='mx-auto flex min-h-64 max-w-lg flex-col items-center justify-center gap-4 text-center'>
      <h1 className='text-2xl font-semibold'>
        <I18nText messageKey='notFound.title' />
      </h1>
      <p className='text-sm text-gray-600'>
        <I18nText messageKey='notFound.description' />
      </p>
      <Link
        className='rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800'
        href='/'
      >
        <I18nText messageKey='notFound.back' />
      </Link>
    </main>
  );
}
