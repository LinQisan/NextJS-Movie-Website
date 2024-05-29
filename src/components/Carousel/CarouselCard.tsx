import { getBase64 } from '@/lib/helpers';
import Image from 'next/image';
import Link from 'next/link';

export default async function CarouselCard({
  imgUrl,
  name,
  year,
  id,
}: {
  imgUrl: string;
  name: string;
  year: number;
  id: number;
}) {
  return (
    <div className='flex w-[150px] flex-col gap-1 md:w-[200px]'>
      <Link
        href={`/film/${id}`}
        className='aspect-[2/3] select-none overflow-hidden rounded-lg shadow-md'
      >
        <Image
          src={imgUrl}
          alt={name}
          width={200}
          height={300}
          overrideSrc={`/${name}.jpg`}
          placeholder='blur'
          blurDataURL={await getBase64(imgUrl)}
          className='object-cover'
        />
      </Link>
      <h2 className='text-xm inline-block truncate text-left font-semibold'>
        {name}
      </h2>
      <p className='-mt-1 inline-block text-left text-xs text-gray-800 '>
        {year}
      </p>
    </div>
  );
}
