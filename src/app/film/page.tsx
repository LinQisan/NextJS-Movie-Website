import GridLoading from '@/components/Loading/GridLoading';
import { PortraitCardMap } from '@/components/MediaCard/PortraitCardMap';
import GridWrapper from '@/components/ui/GridWrapper';

import { Suspense } from 'react';

export default async function Page() {
  return (
    <GridWrapper>
      <Suspense fallback={<GridLoading />}>
        <PortraitCardMap />
      </Suspense>
    </GridWrapper>
  );
}
