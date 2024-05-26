import GridLoading from '@/components/Loading/GridLoading';
import GridWrapper from '@/components/PortraitCard/GridWrapper';
import { PortaitCardMap } from '@/components/PortraitCard/PortraitCardMap';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <GridWrapper>
      <Suspense fallback={<GridLoading />}>
        <PortaitCardMap />
      </Suspense>
    </GridWrapper>
  );
}
