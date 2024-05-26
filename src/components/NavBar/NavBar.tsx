'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import NavSearch from './NavSearch';
import NavLink from './NavLink';
import { usePathname } from 'next/navigation';

export function NavBar() {
  const [searching, setSearching] = React.useState<boolean>(false);
  const pathname = usePathname();

  React.useEffect(() => {
    if (pathname === '/search') {
      setSearching(true);
    }
  }, [pathname]);
  return (
    <motion.nav
      animate={{}}
      className='mx-auto flex h-12 w-fit items-center justify-center rounded-full bg-black p-2 transition-all md:h-16'
    >
      {searching ? (
        <NavSearch handleSearching={() => setSearching(false)} />
      ) : (
        <AnimatePresence>
          <motion.div
            key='link'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center justify-around gap-4'
          >
            <NavLink pathname={pathname} />
            <motion.button
              className='pr-3 pt-1'
              whileHover={{
                scale: 1.2,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              onClick={() => setSearching(true)}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={2.5}
                stroke='white'
                className='h-4 w-4 md:h-8 md:w-8'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
                />
              </svg>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.nav>
  );
}
