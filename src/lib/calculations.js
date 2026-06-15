// ─── Emission factors (kg CO₂ / unit, India-calibrated) ──────────────────────
export const EF = {
  car: 0.21, bus: 0.089, train: 0.041, metro: 0.036, flight: 255,
  // ac is a small MARGINAL factor — electricity already captures most AC usage.
  // 2.87 was double-counting heavily; 0.5 represents incremental cooling penalty.
  electricity: 0.82, ac: 0.5, gas: 2.04,
  vegan: 1.5, vegetarian: 2.5, nonveg: 7.2,
  clothing: 33, electronics: 300, online: 3,
}

export const BUDGET     = 2300   // IPCC 1.5°C per-capita annual kg CO₂
export const INDIA_AVG  = 1900   // India avg kg CO₂/yr per person 2024
export const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ─── Core calculator ─────────────────────────────────────────────────────────
export function calcFP(d) {
  const carKm   = d.car_km      ?? d.carKm      ?? 0
  const busKm   = d.bus_km      ?? d.busKm      ?? 0
  const trainKm = d.train_km    ?? d.trainKm    ?? 0
  const metroKm = d.metro_km    ?? d.metroKm    ?? 0
  const flights = d.flights     ?? 0
  const elec    = d.electricity ?? 0
  const ac      = d.ac_hours    ?? d.acHours    ?? 0
  const gas     = d.gas         ?? 0
  const cloth   = d.clothing    ?? 0
  const elecs   = d.electronics ?? 0
  const online  = d.online_orders ?? d.online   ?? 0
  const diet    = d.diet        ?? 'vegetarian'

  const transport = carKm*4*EF.car + busKm*4*EF.bus + trainKm*4*EF.train + metroKm*4*EF.metro + flights*EF.flight/12
  const energy    = elec*EF.electricity + ac*30*EF.ac + gas*EF.gas
  const food      = EF[diet]*30
  const shopping  = cloth*EF.clothing/12 + elecs*EF.electronics/12 + online*4*EF.online
  const monthly   = transport + energy + food + shopping

  return {
    transport: Math.max(0, transport),
    energy:    Math.max(0, energy),
    food:      Math.max(0, food),
    shopping:  Math.max(0, shopping),
    monthly:   Math.max(0, monthly),
    yearly:    Math.max(0, monthly * 12),
  }
}

// ─── Score (8–100) ────────────────────────────────────────────────────────────
// Ceiling raised to 16 000 kg/yr so realistic Indian footprints (2k–8k)
// spread across the full 8–100 range instead of all hitting the floor.
//   0 kg/yr  → 100   |   ~2 000 → ~88   |   ~6 000 → ~65
//   ~10 000  → ~42   |   ~16 000 → 8 (minimum)
export function getScore(yearly) {
  const raw   = Math.round(100 - (yearly / 16000) * 92)
  const score = Math.max(8, Math.min(100, raw))

  const level =
    yearly < 1500  ? 'Eco Champion'  :
    yearly < 3000  ? 'Green Hero'    :
    yearly < 6000  ? 'Earth Friend'  :
    yearly < 11000 ? 'Aware Citizen' : 'Carbon Heavy'

  const color =
    yearly < 1500  ? '#c2f542' :
    yearly < 3000  ? '#86efac' :
    yearly < 6000  ? '#f59e0b' :
    yearly < 11000 ? '#fb923c' : '#ef4444'

  return { score, level, color, xp: Math.max(60, Math.round(950 - yearly / 15)) }
}

// ─── Top 3 personalised actions ──────────────────────────────────────────────
export function getTopActions(fp) {
  const pool = {
    transport: { a: 'Use public transit 2 days/week',  save: fp.transport * 0.22, xp: 80,  icon: '🚌' },
    energy:    { a: 'Set AC to 24°C instead of 20°C',  save: fp.energy    * 0.18, xp: 70,  icon: '❄️' },
    food:      { a: 'One plant-based day per week',     save: fp.food      * 0.14, xp: 60,  icon: '🥗' },
    shopping:  { a: 'Skip one online order per week',   save: fp.shopping  * 0.20, xp: 50,  icon: '📦' },
  }
  return ['transport', 'energy', 'food', 'shopping']
    .sort((a, b) => fp[b] - fp[a])
    .slice(0, 3)
    .map(cat => ({ ...pool[cat], save: Math.round(pool[cat].save), cat }))
}

// ─── Estimated monthly energy/fuel cost (₹) ──────────────────────────────────
export function calcMoney(fp) {
  const monthly = Math.round(
    (fp.energy / EF.electricity) * 7 +
    (fp.transport / EF.car)      * (100 / 15) +
    fp.shopping * 2
  )
  return { monthly, yearly: monthly * 12 }
}

// ─── Seeded pseudo-random (stable across re-renders) ─────────────────────────
function sr(s) { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x) }

export function makeTrend(monthly, seed = 1) {
  return MONTHS.map((month, i) => ({
    month,
    value: Math.round(monthly * (0.82 + (i / 11) * 0.22 + (sr(seed + i) - 0.5) * 0.08)),
  }))
}

// ─── Budget helper ────────────────────────────────────────────────────────────
export function getBudgetDate(yearly) {
  if (yearly <= BUDGET) return null
  const day = Math.round((BUDGET / yearly) * 365)
  return new Date(new Date().getFullYear(), 0, day)
    .toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}
