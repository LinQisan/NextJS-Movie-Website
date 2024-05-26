import { getBase64 } from '@/lib/util';
import Image from 'next/image';
import Link from 'next/link';

export default async function LandscapeCard({
  imgUrl,
  name,
  airDate,
  id,
}: {
  imgUrl: string;
  name: string;
  airDate: string;
  id: number;
}) {
  return (
    <div className='flex w-[337.5px] flex-col gap-1'>
      <Link
        href={`/tv/${id}`}
        className='aspect-[16/9] select-none overflow-hidden rounded-lg shadow-md'
      >
        <Image
          src={imgUrl}
          alt={name}
          width={337.5}
          height={225}
          overrideSrc={`/${name}.jpg`}
          placeholder='blur'
          blurDataURL={await getBase64(imgUrl)}
          className='object-cover'
        />
      </Link>
      {/* <p className='-mt-1 inline-block text-center text-xs text-gray-800 '>
        {airDate}-now
      </p> */}
      <p className='text-xm inline-block truncate text-center font-semibold'>
        {name}
      </p>
    </div>
  );
}
