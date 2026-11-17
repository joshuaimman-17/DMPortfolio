import { buildLlmsText } from '@/lib/llms';

// Statically cached; rebuilt whenever the admin saves (tag + path revalidation in /api/revalidate).
export const revalidate = false;

export async function GET() {
  const body = await buildLlmsText(true);
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
    },
  });
}
