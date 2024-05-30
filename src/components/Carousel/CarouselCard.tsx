import Link from 'next/link';
import ImageHolder from '../ui/ImageHolder';

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
        <ImageHolder
          src={imgUrl}
          alt={name}
          width={200}
          height={300}
          overrideSrc={`/${name}`}
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
