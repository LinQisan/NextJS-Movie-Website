import { type NextRequest } from 'next/server';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.TMDB_Bearer}`,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { tv: string } },
) {
  const searchParams = request.nextUrl.searchParams;

  const season_number = searchParams.get('season');

  const res = await fetch(
    `https://api.themoviedb.org/3/tv/${params.tv}/season/${season_number}?language=zh-CN`,
    options,
  );
  const data = await res.json();

  return Response.json({ data });
}
