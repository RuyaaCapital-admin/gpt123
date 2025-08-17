export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'BTC-USD.CC';
  const token = process.env.EODHD_API_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: 'EODHD_API_TOKEN missing' }), { status: 500 });

  const url = `https://eodhd.com/api/real-time/${encodeURIComponent(symbol)}?api_token=${token}&fmt=json`;
  const r = await fetch(url, { cache: 'no-store' });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { 'content-type': 'application/json' } });
}
