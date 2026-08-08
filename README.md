# Energy Radar — Frontend

A dark, map-first React/Next.js frontend for the Energy Radar hackathon project.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- SWR polling
- React Leaflet + OpenStreetMap
- Lucide icons

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Current state

The UI uses a small local demo dataset behind `/api/projects`. SWR refreshes the endpoint every 30 seconds so the data layer is ready to be replaced by Supabase/live ingestion later.

## Next steps

1. Replace `/api/projects` with Supabase.
2. Add OpenAI structured analysis.
3. Connect real energy data.
4. Add live GridStatus context.
5. Deploy to Vercel.
