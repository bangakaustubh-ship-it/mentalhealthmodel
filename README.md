# Mental Health Predictor

AI-powered student mental health assessment tool. Predicts a wellness score (1–10) based on social media usage, sleep, study habits, physical activity, stress, mood, diet, and social support.

## Tech Stack

- **Next.js 16** — frontend + API routes (no separate backend)
- **TypeScript** — full type safety
- **Tailwind CSS** — styling
- **jsPDF** — client-side PDF report generation
- **Lucide React** — icons

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

Deployed on Vercel. Set **Root Directory** to `frontend` in Vercel project settings.

## Features

- Mental health score prediction (1–10)
- 16 input factors including mood, diet, social support, screen time
- Specific personalised recommendations
- Downloadable PDF report with helpline numbers
- Fully client-side — no database, no data stored
