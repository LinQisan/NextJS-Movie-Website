import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Skeleton } from '../ui/skeleton';

export default function CreditsLoading() {
  return (
    <>
      <Tabs defaultValue='cast'>
        <TabsList className='w-full'>
          <TabsTrigger className='w-1/2' value='cast'>
            Cast
          </TabsTrigger>
          <TabsTrigger className='w-1/2' value='crew'>
            Crew
          </TabsTrigger>
        </TabsList>
        <TabsContent value='cast'>
          <Card className='flex w-full flex-col gap-2'>
            {Array.from({ length: 2 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </Card>
        </TabsContent>
        <TabsContent value='crew'>
          <Card className='w-full '>
            {Array.from({ length: 2 }, (_, index) => (
              <CardSkeleton key={index} />
            ))}
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function CardSkeleton() {
  return (
    <div className='flex gap-2'>
      <Skeleton className='h-[80px] w-[70px]' />
      <div className='flex flex-col justify-between gap-2'>
        <Skeleton className='h-4 w-[50px]' />
        <Skeleton className='h-2 w-[200px]' />
        <Skeleton className='h-2 w-[200px]' />
      </div>
    </div>
  );
}
