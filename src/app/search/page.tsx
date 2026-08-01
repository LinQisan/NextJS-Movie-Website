import Search from '@/components/Search/Search';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { query = '' } = await searchParams;

  return <Search query={query} />;
}
