import { Skeleton } from '../ui/skeleton';
import TopProgress from '../ui/TopProgress';

export default function GridLoading({ i = 20 }: { i?: number }) {
  return (
    <>
      <TopProgress />
      {Array.from({ length: i }, (_, index) => (
        <Item key={index} />
      ))}
    </>
  );
}

function Item() {
  return (
    <>
      <div className='flex flex-col space-y-2'>
        <Skeleton className='h-[225px] w-[150px] rounded-xl' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-[150px]' />
          <Skeleton className='h-4 w-[100px]' />
        </div>
      </div>
    </>
  );
}
