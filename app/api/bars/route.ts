export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol') || 'BTC-USD.CC';
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const token = process.env.EODHD_API_TOKEN;
  if (!token) return new Response(JSON.stringify({ error: 'EODHD_API_TOKEN missing' }), { status: 500 });
  if (!from || !to) return new Response(JSON.stringify({ error: 'from/to required YYYY-MM-DD' }), { status: 400 });

  const url = `https://eodhd.com/api/eod/${encodeURIComponent(symbol)}?from=${from}&to=${to}&api_token=${token}&fmt=json`;
  const r = await fetch(url, { cache: 'no-store' });
  const text = await r.text();
  return new Response(text, { status: r.status, headers: { 'content-type': 'application/json' } });
}
