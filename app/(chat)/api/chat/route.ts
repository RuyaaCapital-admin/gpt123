export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const key = process.env.OPENAI_API_KEY;
    if (!key) return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), { status: 500 });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          { role: 'system', content: 'You are a concise trading assistant. Return short, actionable answers.' },
          { role: 'user', content: prompt || 'Say hello.' }
        ]
      })
    });

    const data = await r.json();
    if (!r.ok) return new Response(JSON.stringify(data), { status: r.status });

    const reply = data?.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ reply }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500 });
  }
}
