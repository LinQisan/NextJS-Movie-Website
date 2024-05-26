// import SearchResult from '@/components/SearchResult';

import Search from '@/components/Search/Search';

export default function Page({
  searchParams,
}: {
  searchParams?: { query?: string };
}) {
  const query = searchParams?.query || '';

  return <Search query={query} />;
}
