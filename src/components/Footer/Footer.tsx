'use client';

import Image from 'next/image';
import Link from 'next/link';

import TmdbSVG from '../../../public/tmdb.svg';
import LogoSVG from '../../../public/Logo.svg';
import { I18nText, useI18n } from '../I18nProvider';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className='themed-footer mx-auto mt-8 w-full max-w-7xl border-t py-5 sm:mt-12'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <Link
          href='/'
          className='themed-footer-brand inline-flex items-center gap-2 font-bold tracking-tight'
        >
          <Image
            src={LogoSVG}
            alt=''
            width={24}
            height={24}
            className='rounded-md'
            aria-hidden='true'
          />
          <I18nText messageKey='brand.full' />
        </Link>

        <nav className='themed-footer-nav flex items-center gap-5 text-xs'>
          <Link
            href='https://www.themoviedb.org/'
            target='_blank'
            rel='noreferrer'
            className='themed-footer-link inline-flex items-center gap-1.5 transition-colors'
            aria-label={t('footer.source')}
          >
            <I18nText messageKey='footer.source' />
            <Image src={TmdbSVG} alt='TMDB' width={42} height={18} />
          </Link>
          <Link
            href='https://github.com/LinQisan/NextJS-Movie-Website'
            target='_blank'
            rel='noreferrer'
            className='themed-footer-link transition-colors'
          >
            <I18nText messageKey='footer.github' />
          </Link>
        </nav>
      </div>

      <div className='themed-footer-meta mt-4 flex flex-col gap-1 text-[11px] leading-5 sm:flex-row sm:items-center sm:justify-between'>
        <p>
          © {new Date().getFullYear()} <I18nText messageKey='brand.full' />
        </p>
        <p className='sm:text-right'>
          <I18nText messageKey='footer.disclaimer' />
        </p>
      </div>
    </footer>
  );
}
