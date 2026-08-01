import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { Suspense } from 'react';
import './globals.css';

import { NavBar } from '@/components/NavBar/NavBar';
import Footer from '@/components/Footer/Footer';
import { I18nProvider } from '@/components/I18nProvider';
import { MotionProvider } from '@/components/MotionProvider';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  localeConfig,
  localeFromValue,
  translate,
} from '@/lib/i18n';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const locale = localeFromValue(
    (await cookies()).get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE,
  );
  const brand = translate(locale, 'brand.full');

  return {
    applicationName: brand,
    title: {
      template: `%s | ${brand}`,
      default: brand,
    },
    description: translate(locale, 'home.srTitle'),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = localeFromValue(
    (await cookies()).get(LOCALE_COOKIE)?.value ?? DEFAULT_LOCALE,
  );

  return (
    <html lang={localeConfig[locale].html}>
      <body
        className={`${inter.className} mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col gap-4 overflow-x-hidden p-4`}
      >
        <MotionProvider>
          <I18nProvider initialLocale={locale}>
            <Suspense
              fallback={
                <div
                  className='mx-auto h-12 w-64 animate-pulse rounded-full bg-zinc-900 md:h-16'
                  aria-hidden='true'
                />
              }
            >
              <NavBar />
            </Suspense>
            {children}

            <Footer />
          </I18nProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
