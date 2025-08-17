'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ISeriesApi, CandlestickData, Time, UTCTimestamp, BusinessDay } from 'lightweight-charts';

type Bar = { time: string | number; open: number; high: number; low: number; close: number };

function toTime(t: string | number): Time {
  if (typeof t === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [y, m, d] = t.split('-').map(Number);
    return { year: y, month: m as any, day: d } as BusinessDay;
  }
  const n = Number(t);
  const sec = n > 1e12 ? Math.floor(n / 1000) : n;
  return sec as UTCTimestamp;
}

function toCandles(bars: any[]): CandlestickData<Time>[] {
  return (bars || []).map((b) => ({
    time: toTime(b.date ?? b.time ?? b.t),
    open: Number(b.open ?? b.o),
    high: Number(b.high ?? b.h),
    low: Number(b.low ?? b.l),
    close: Number(b.close ?? b.c),
  }));
}

export default function Home() {
  const chartRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [symbol, setSymbol] = useState('BTC-USD.CC');
  const [reply, setReply] = useState('');

  async function fetchBars(sym: string): Promise<Bar[]> {
    const to = new Date();
    const from = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const r = await fetch(`/api/bars?symbol=${encodeURIComponent(sym)}&from=${fmt(from)}&to=${fmt(to)}`, { cache: 'no-store' });
    const data = await r.json();
    if (!Array.isArray(data)) return [];
    return data.map((b: any) => ({ time: b.date, open: b.open, high: b.high, low: b.low, close: b.close }));
  }

  async function ask(prompt: string) {
    setReply('…');
    const r = await fetch('/(chat)/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt }) });
    const j = await r.json();
    setReply(j.reply || JSON.stringify(j));
  }

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = createChart(chartRef.current, {
      height: 520,
      layout: { background: { color: '#0b0f14' }, textColor: '#e6e9ef' },
      grid: { vertLines: { color: '#1a222d' }, horzLines: { color: '#1a222d' } }
    });
    const series = chart.addCandlestickSeries();
    seriesRef.current = series;

    (async () => {
      const bars = await fetchBars(symbol);
      series.setData(toCandles(bars));
    })();

    const onResize = () => chart.applyOptions({ width: chartRef.current!.clientWidth });
    window.addEventListener('resize', onResize);
    onResize();

    return () => { window.removeEventListener('resize', onResize); chart.remove(); };
  }, [symbol]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 18, marginBottom: 12 }}>Liirat Assistant Starter</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.trim())}
          placeholder="BTC-USD.CC or XAUUSD.FOREX"
          style={{ padding: 8, flex: 1, background: '#0f141b', color: '#e6e9ef', border: '1px solid #2a3441', borderRadius: 8 }}
        />
        <button
          onClick={async () => {
            const bars = await fetchBars(symbol);
            seriesRef.current?.setData(toCandles(bars));
          }}
          style={{ padding: '8px 12px', background: '#1e293b', color: '#e6e9ef', borderRadius: 8, border: '1px solid #334155' }}
        >
          Load
        </button>
      </div>
      <div ref={chartRef} style={{ width: '100%', border: '1px solid #1a222d', borderRadius: 8 }} />
      <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
        <textarea id="prompt" placeholder="Ask analysis… e.g., Find S/R levels for the last month"
          style={{ minHeight: 80, padding: 8, background: '#0f141b', color: '#e6e9ef', border: '1px solid #2a3441', borderRadius: 8 }} />
        <button
          onClick={() => {
            const prompt = (document.getElementById('prompt') as HTMLTextAreaElement).value || '';
            ask(`Symbol: ${symbol}. Analyze the last month bars; suggest 3-5 support/resistance prices and a one-paragraph summary.`);
          }}
          style={{ padding: '8px 12px', background: '#0ea5e9', color: '#001016', borderRadius: 8, border: 'none', fontWeight: 600 }}
        >
          Ask AI
        </button>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#0f141b', color: '#e6e9ef', padding: 8, borderRadius: 8, border: '1px solid #2a3441' }}>{reply}</pre>
      </div>
      <p style={{ opacity: 0.7, marginTop: 16, fontSize: 12 }}>Set env vars on Vercel: OPENAI_API_KEY, EODHD_API_TOKEN.</p>
    </div>
  );
}
