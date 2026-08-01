import { getSeasonDetail, TMDBError } from '@/lib/data';
import { type NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tv: string }> },
) {
  const { tv } = await params;
  const seasonNumber = request.nextUrl.searchParams.get('season');
  if (seasonNumber === null) {
    return Response.json({ error: '缺少 season 参数。' }, { status: 400 });
  }

  try {
    const data = await getSeasonDetail(tv, seasonNumber);
    return Response.json({ data });
  } catch (error) {
    const status = error instanceof TMDBError ? error.status : 500;
    const message = error instanceof Error ? error.message : '无法获取季信息。';
    return Response.json({ error: message }, { status });
  }
}
