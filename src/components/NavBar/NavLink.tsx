'use client';

import Link from 'next/link';
import { I18nText } from '../I18nProvider';

const NavLink = ({ pathname }: { pathname: null | string }) => {
  const links = [
    { messageKey: 'nav.home' as const, href: '/' },
    { messageKey: 'nav.movies' as const, href: '/film' },
    { messageKey: 'nav.tv' as const, href: '/tv' },
    // { label: '我的', href: '/user' },
  ];

  return (
    <div className='flex min-w-0 flex-1 justify-center gap-0.5 sm:gap-1 md:gap-2'>
      {links.map(({ messageKey, href }) => {
        const isActive =
          href === '/'
            ? pathname === href
            : pathname === href || pathname?.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`nav-theme-text group flex shrink-0 flex-col whitespace-nowrap rounded-full px-1.5 py-2 text-center text-xs font-semibold transition-colors sm:px-2 sm:text-sm md:px-2 md:py-3 md:text-lg ${isActive ? 'nav-theme-active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span
              className={`h-1 rounded-full transition-colors ${isActive ? 'nav-theme-indicator' : 'nav-theme-hover-indicator'}`}
              aria-hidden='true'
            />
            <I18nText messageKey={messageKey} />
          </Link>
        );
      })}
    </div>
  );
};

export default NavLink;
