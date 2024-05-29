import { getSeasonDetails, season } from '@/lib/data';
import { ReactNode } from 'react';
import SeasonsSelect from './SeasonsSelect';

export default async function SeasonsLayout({
  id,
  seasons,
}: {
  id: string;
  seasons: season[];
}) {
  const data = await getSeasonDetails(id, seasons);

  return <SeasonsSelect data={data} />;
}
