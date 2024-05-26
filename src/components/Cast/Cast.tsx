import Image from 'next/image';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface data {
  department: string;
  name: string;
  character: string;
  profile_path: string | null;
}

export default function Cast({
  department,
  name,
  character,
  profile_path,
}: data) {
  return (
    <div className='flex gap-2 pl-2'>
      <div className='flex aspect-[2/3] h-[80px] w-[70px] items-center justify-center overflow-hidden rounded-lg border-2'>
        {profile_path ? (
          <Image
            src={`https://media.themoviedb.org/t/p/w276_and_h350_face${profile_path}`}
            alt={`${name}'s Photos`}
            width={70}
            height={80}
            className='object-cover'
          />
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            stroke='black'
            fill='none'
            className='size-10'
          >
            <path
              fillRule='evenodd'
              d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </div>
      <div className='flex flex-col justify-between'>
        <div className='flex flex-col'>
          <h2 className=''>{name}</h2>
          <Badge className='w-fit select-none text-clip text-nowrap rounded-md bg-zinc-950 px-2 py-0 text-center font-mono text-xs font-light text-white hover:bg-zinc-900'>
            {department}
          </Badge>
        </div>
        <p className='truncate text-sm text-gray-600'>{character}</p>
      </div>
    </div>
  );
}
