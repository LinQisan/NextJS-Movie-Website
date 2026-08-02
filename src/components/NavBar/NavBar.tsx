'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';

import NavSearch from './NavSearch';
import NavLink from './NavLink';
import LanguageSwitcher from './LanguageSwitcher';
import LogoSVG from '../../../public/Logo.svg';
import { I18nText, useI18n } from '../I18nProvider';

export function NavBar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [searching, setSearching] = React.useState(pathname === '/search');
  const isDetailPage = Boolean(pathname?.match(/^\/(?:film|tv)\/[^/]+/));
  return (
    <nav
      data-detail-nav={isDetailPage ? 'true' : undefined}
      className={`${isDetailPage ? 'detail-navbar' : ''} themed-navbar mx-auto flex h-12 items-center justify-center overflow-hidden rounded-full p-2 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none md:h-16 ${
        searching
          ? 'w-[calc(100vw-2rem)] sm:w-96'
          : 'w-[282px] sm:w-[430px] md:w-[520px]'
      }`}
    >
      <AnimatePresence initial={false} mode='wait'>
        {searching ? (
          <NavSearch key='search' handleSearching={() => setSearching(false)} />
        ) : (
          <m.div
            key='links'
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className='flex w-full min-w-0 items-center gap-1 sm:gap-2 md:gap-3'
          >
            <Link
              href='/'
              className='nav-theme-text ml-1 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black'
              aria-label={t('brand.full')}
            >
              <Image
                src={LogoSVG}
                alt=''
                width={40}
                height={40}
                className='size-8 rounded-lg md:size-10'
                aria-hidden='true'
                priority
              />
              <span className='hidden text-sm font-bold tracking-tight sm:block md:text-lg'>
                <I18nText messageKey='brand.short' />
              </span>
            </Link>
            <span
              className='nav-theme-divider h-6 w-px md:h-8'
              aria-hidden='true'
            />
            <NavLink pathname={pathname} />
            <div className='flex shrink-0 items-center gap-0.5 md:gap-1'>
              <button
                type='button'
                aria-label={t('nav.openSearch')}
                className='nav-theme-text flex size-7 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110 md:size-8'
                onClick={() => setSearching(true)}
              >
                <SearchLogo />
              </button>
              <LanguageSwitcher />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function SearchLogo() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2.5}
      stroke='currentColor'
      className='size-4 md:size-5'
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
