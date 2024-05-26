import Image from 'next/image';
import TmdbSVG from '../../../public/tmdb.svg';
import { FaGithub } from 'react-icons/fa';
import { Separator } from '../ui/separator';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className=''>
      <Separator className='mb-2' />
      <div className='flex flex-col gap-2'>
        <div className='flex gap-2'>
          <span className='text-sm font-semibold'>
            Designed and built by me, Data provided by
          </span>{' '}
          <Image src={TmdbSVG} alt='TMDB LOGO' width={50} height={50} />
        </div>
        <p className='text-sm'>
          This product uses the TMDB API but is not endorsed or certified by
          TMDB.
        </p>
        <div className='flex items-center gap-1 text-sm'>
          Built using the Next.js. View the code:
          <Link href={'/'} className='h-fit'>
            <FaGithub />
          </Link>
        </div>
        <p className='text-sm font-semibold '>
          © 2024 Forces M&T. All rights reserved
        </p>
      </div>
    </footer>
  );
}
