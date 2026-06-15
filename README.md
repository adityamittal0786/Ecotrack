<<<<<<< HEAD
# EcoTrack

**Carbon footprint tracker with real-time insights, gamification, and scenario modelling.**

---

## Features

| Feature              | Description                                                        |
|----------------------|--------------------------------------------------------------------|
| **Calculator**       | India-calibrated emission factors across transport, energy, food, shopping |
| **Score Rings**      | Custom concentric SVG rings — each category vs its 1.5°C budget share |
| **Live Clock**       | Today's personal CO₂ ticking up in real time                      |
| **Impact Simulator** | Scenario modelling — see savings instantly as you adjust sliders   |
| **Carbon Twin**      | Your annual CO₂ in trees, flights, burgers, Arctic ice, and more  |
| **Achievements**     | 12 badges, XP, levels, weekly challenges, streak tracking          |
| **Leaderboard**      | Community rankings by Eco Score                                    |
| **Recalculate**      | Update your footprint anytime from Settings after signup           |
| **Auth**             | Supabase Auth — email/password + Google OAuth                      |

---

## Stack

- **React 18** + **Vite** — frontend
- **Recharts** — charts
- **Supabase** — database, auth, RLS
- **Vercel** — deployment

---

## Project Structure

```
ecotrack-final/
├── index.html                      # Font loaded in <head> — no FOUT
├── vite.config.js
├── package.json
├── vercel.json
├── .env.example
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                    # Entry — injects global CSS
│   ├── App.jsx                     # Auth flow, state, routing
│   ├── design.js                   # Colors, style helpers, global CSS
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Shared.jsx              # ScoreRings, CarbonClock, AN, Chip, Toasts, Page
│   ├── hooks/
│   │   └── useCountUp.js
│   ├── lib/
│   │   ├── calculations.js         # calcFP, getScore, getTopActions, calcMoney, makeTrend
│   │   └── supabase.js             # Client + all DB helpers
│   └── pages/
│       ├── AuthPage.jsx
│       ├── Onboarding.jsx          # Also used for recalculate flow
│       ├── Dashboard.jsx
│       ├── ImpactSimulator.jsx
│       ├── CarbonTwin.jsx
│       ├── Achievements.jsx
│       ├── Progress.jsx
│       ├── Leaderboard.jsx
│       └── Settings.jsx            # Has Recalculate Footprint button
└── supabase/
    └── migrations/
        └── 001_schema.sql          # All tables, RLS, triggers, indexes, leaderboard view
```

---

## Quick Start

### 1. Install
```bash
cd ecotrack-final
npm install
```

### 2. Create a Supabase project
Go to [app.supabase.com](https://app.supabase.com) → New Project.  
Copy your **Project URL** and **anon key** from Project Settings → API.

### 3. Run the migration
In Supabase Dashboard → SQL Editor, paste and run `supabase/migrations/001_schema.sql`.

### 4. Set env vars
```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

### 5. Run
```bash
npm run dev
# → http://localhost:3000
```

---

## Recalculate Footprint

After signing up and completing onboarding, users can update their footprint anytime:

**Settings → Recalculate Footprint →** runs the full 3-step questionnaire again with the existing name pre-filled, updates all data in Supabase, and returns to the dashboard with fresh results.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set these environment variables in your Vercel project dashboard:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## Emission Factors (India-calibrated)

| Category    | Factor             | Source                  |
|-------------|-------------------|-------------------------|
| Electricity | 0.82 kg CO₂/kWh  | India CEA 2024          |
| Car         | 0.21 kg CO₂/km   | IPCC AR6                |
| Food        | 1.5–7.2 kg/day   | Our World in Data       |
| Flights     | 255 kg/flight     | ICAO (domestic India)   |
| Shopping    | 33–300 kg/item    | DEFRA lifecycle data    |
=======
# Ecotrack
>>>>>>> d44d10b5c151ed115bcb6df6b975a30157f2e679
