'use client';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

export default function NavSearch({
  handleSearching,
}: {
  handleSearching: React.MouseEventHandler<HTMLButtonElement>;
}) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const handleSearch = useDebouncedCallback((param: string) => {
    const params = new URLSearchParams(searchParams);

    if (param) {
      const encodedTerm = param;
      params.set('query', encodedTerm);
    } else {
      params.delete('query');
    }
    replace(`/search?${params.toString()}`);
  }, 300);

  return (
    <AnimatePresence>
      <motion.div
        key='search'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='relative flex gap-2 rounded-md'
      >
        <div className='w-6'></div>
        <div className=' absolute inset-y-0 left-0 flex items-center pl-9 '>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-6 w-6'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
            />
          </svg>
        </div>

        <input
          id='search'
          name='movie'
          type='text'
          className='block w-full cursor-text rounded-md border-0 py-1.5 pl-10 focus:outline-none focus:ring-4 focus:ring-black'
          placeholder='Search'
          defaultValue={searchParams.get('query')?.toString()}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <motion.button
          className='flex items-center'
          whileHover={{
            scale: 1.2,
            rotate: 90,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          onClick={handleSearching}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2.5}
            stroke='white'
            className='h-6 w-6'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18 18 6M6 6l12 12'
            />
          </svg>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
