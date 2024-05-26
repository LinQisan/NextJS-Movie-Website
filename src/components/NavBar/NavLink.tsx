// NavLink.tsx
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const NavLink = ({ pathname }: { pathname: null | string }) => {
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);
  const id = React.useId();

  const links = [
    { label: '近期', href: '/' },
    { label: '电影', href: '/film' },
    { label: '电视剧', href: '/tv' },
    // { label: '我的', href: '/user' },
  ];

  return (
    <div className='flex gap-4' onMouseLeave={() => setHoveredLink(null)}>
      {links.map(({ label, href }) => {
        const isActive = pathname === href;
        const isHovered = hoveredLink === href;
        return (
          <div
            key={href}
            className='flex flex-col whitespace-nowrap rounded-full px-4 py-2 text-center text-sm font-semibold transition-colors md:text-2xl'
          >
            {isHovered || isActive ? (
              <motion.div
                layoutId={id}
                className='rounded-full'
                initial={{ borderRadius: 9999 }}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 9999,
                  padding: 2,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            ) : (
              <div className='rounded-full bg-black p-0.5'></div>
            )}
            <Link
              href={href}
              className={'text-white'}
              onMouseEnter={() => setHoveredLink(href)}
            >
              {label}
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default NavLink;
