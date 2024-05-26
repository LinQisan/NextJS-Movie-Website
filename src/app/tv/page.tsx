import { LandscapeCardMap } from '@/components/LandscapeCard/LandscapeCardMap';
import GridLoading from '@/components/Loading/GridLoading';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <div className='grid grid-cols-1 gap-4 place-self-center md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'>
      <Suspense fallback={<GridLoading />}>
        <LandscapeCardMap />
      </Suspense>
    </div>
  );
}
