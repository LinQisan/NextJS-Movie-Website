import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { NavBar } from '@/components/NavBar/NavBar';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Forces',
    default: 'Forces',
  },
  description: 'Main Page',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${inter.className} mx-auto flex w-[100vw] max-w-fit flex-col gap-4 p-4`}
      >
        <NavBar />
        {children}

        <Footer />
      </body>
    </html>
  );
}
