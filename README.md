# Liirat Assistant Starter (Next.js + OpenAI + EODHD)

Minimal, production-friendly starter to deploy on Vercel:
- **Next.js App Router**
- **/api/chat** → OpenAI (no SDK needed)
- **/api/bars** and **/api/quote** → EODHD
- **Lightweight Charts** on the homepage

## Deploy (Vercel)
1. Create a new project from this repo.
2. Add env vars (Production + Preview):
   - `OPENAI_API_KEY=sk-...`
   - `EODHD_API_TOKEN=...`
3. Deploy.

## Dev
```bash
npm i
npm run dev
```

## Notes
- Symbols: `BTC-USD.CC`, `XAUUSD.FOREX`, etc.
- Adjust chart timeframe in `app/page.tsx`.
- Extend `/api/chat` to stream or add tool-calling if needed.
