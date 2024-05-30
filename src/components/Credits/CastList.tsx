import { Badge } from '../ui/badge';
import { StarLogo } from './StarLogo';
import ImageHolder from '../ui/ImageHolder';

type BaseCast = {
  id: number;
  name: string;
  profile_path?: string;
  known_for_department: string;
};

type TVCast = BaseCast & {
  roles: { character: string }[];
};

type MovieCast = BaseCast & {
  character: string;
};

type CastProps = {
  department: string;
  name: string;
  profile_path?: string;
  character: string;
};

export default function CastList({
  data,
  media,
}: {
  data: TVCast[] | MovieCast[];
  media: 'tv' | 'movie';
}) {
  return data.map((castMember) => {
    const character =
      media === 'tv'
        ? (castMember as TVCast).roles[0].character
        : (castMember as MovieCast).character;

    return (
      <Cast
        key={castMember.id}
        department={castMember.known_for_department}
        name={castMember.name}
        profile_path={castMember.profile_path}
        character={character}
      />
    );
  });
}

function Cast({ department, name, character, profile_path }: CastProps) {
  return (
    <div className='flex gap-2 pl-2'>
      <div className='flex aspect-[2/3] h-[80px] w-[70px] items-center justify-center overflow-hidden rounded-lg border-2'>
        {profile_path ? (
          <ImageHolder
            src={`https://media.themoviedb.org/t/p/w276_and_h350_face${profile_path}`}
            alt={`${name}'s Photos`}
            width={70}
            height={80}
            overrideSrc={`/${name}`}
          />
        ) : (
          <StarLogo />
        )}
      </div>
      <div className='flex flex-col justify-between'>
        <div className='flex flex-col'>
          <h2>{name}</h2>
          <Badge className='w-fit select-none text-clip text-nowrap rounded-md bg-zinc-950 px-2 py-0 text-center font-mono text-xs font-light text-white hover:bg-zinc-900'>
            {department}
          </Badge>
        </div>
        <p className='truncate text-sm text-gray-600'>{character}</p>
      </div>
    </div>
  );
}
