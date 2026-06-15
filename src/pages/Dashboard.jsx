import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { C, RC, K } from '../design.js'
import { getTopActions, calcMoney, BUDGET, getBudgetDate } from '../lib/calculations.js'
import { ScoreRings, AN, Chip, CarbonClock, Page } from '../components/Shared.jsx'

const TIPS = [
  '🚌 Public transit 2×/week saves ~300 kg CO₂/year',
  '🌡️ AC at 24°C instead of 20°C cuts energy use by 20%',
  '🥗 One plant-based day/week saves ~400 kg CO₂/year',
  '💡 LED bulbs use 75% less electricity than incandescent',
  '🚗 Carpooling halves per-person car emissions',
  '🌳 One tree absorbs ~21 kg CO₂/year — plant one',
  '♻️ Recycling aluminium uses 95% less energy',
  '📱 Keeping a phone 1 extra year saves 70 kg CO₂',
]

const TIP = { contentStyle: { background:'#1c1c22', border:'1px solid rgba(194,245,66,0.15)', borderRadius:8, color:'#f1f5f0', fontSize:12, padding:'7px 11px', fontFamily:"'Space Grotesk', sans-serif" }, cursor: { stroke:'#c2f542', strokeWidth:1, strokeDasharray:'3 3' } }

export default function Dashboard({ fp, score, level, color, xp, trend, userData, streak, todayLogs = [], onLog }) {
  const fin       = useMemo(() => calcMoney(fp), [fp.monthly])
  const actions   = useMemo(() => getTopActions(fp), [fp.monthly])
  const budgetPct = Math.min(100, Math.round((fp.yearly / BUDGET) * 100))
  const budgetOver= fp.yearly > BUDGET
  const budgetDate= getBudgetDate(fp.yearly)
  const tipIdx    = new Date().getDate() % TIPS.length

  const catPie = [
    { name: 'Transport', value: Math.round(fp.transport), color: RC[0] },
    { name: 'Energy',    value: Math.round(fp.energy),    color: RC[1] },
    { name: 'Food',      value: Math.round(fp.food),      color: RC[2] },
    { name: 'Shopping',  value: Math.round(fp.shopping),  color: RC[3] },
  ]

  const FONT = "'Space Grotesk', system-ui, sans-serif"

  return (
    <Page>
      <div style={{ padding: '1.75rem', maxWidth: 1200, margin: '0 auto', fontFamily: FONT }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ color: C.mut, fontSize: 10, letterSpacing: '1.5px', marginBottom: 2 }}>MISSION CONTROL</div>
            <h2 style={{ fontFamily: FONT, fontSize: '1.6rem', fontWeight: 800, color: C.txt, letterSpacing: '-0.5px' }}>
              {userData?.name || 'Dashboard'}<span style={{ color: C.acc }}>.</span>
            </h2>
          </div>
          <div style={{ ...K.card, padding: '0.65rem 1rem', display: 'flex', gap: 8, alignItems: 'center', maxWidth: 380, background: C.surf }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.acc, animation: 'pulse 2.2s infinite', flexShrink: 0 }} />
            <span style={{ color: C.mut, fontSize: 12 }}>{TIPS[tipIdx]}</span>
          </div>
        </div>

        {/* ── ROW 1: Score card + KPI cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 14, marginBottom: 14 }}>

          {/* Score card — self-contained, no overflow */}
          <div style={{ ...K.card, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '1.5rem 1.25rem',
            background: `linear-gradient(160deg, ${color}07 0%, transparent 60%)`,
            border: `1px solid ${color}28` }}>
            <div style={{ color: C.mut, fontSize: 9, letterSpacing: '2px', marginBottom: 12, fontWeight: 600 }}>
              ECO FOOTPRINT
            </div>
            <ScoreRings fp={fp} score={score} color={color} size={200} />
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <div style={{ color: color, fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.5px' }}>
                {(fp.yearly / 1000).toFixed(1)}t CO₂/yr
              </div>
              <div style={{ color: C.mut, fontSize: 12, marginTop: 2 }}>{level}</div>
            </div>
            {/* Budget bar */}
            <div style={{ width: '100%', marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.mut, marginBottom: 5 }}>
                <span>1.5°C Budget</span>
                <span style={{ color: budgetOver ? C.org : C.acc }}>{budgetPct}% used</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: C.bdr, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, budgetPct)}%`,
                  background: budgetOver ? `linear-gradient(90deg, ${C.org}, ${C.red})` : `linear-gradient(90deg, ${C.acc}, #86efac)`,
                  transition: 'width 1.4s ease' }} />
              </div>
              {budgetOver && (
                <div style={{ color: C.org, fontSize: 10, marginTop: 4 }}>⚠ Budget ends {budgetDate}</div>
              )}
              {!budgetOver && (
                <div style={{ color: C.acc, fontSize: 10, marginTop: 4 }}>✓ Within safe carbon limit</div>
              )}
            </div>
          </div>

          {/* KPI grid — 6 cards in 3×2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 11 }}>
            {[
              { l: 'MONTHLY',      v: Math.round(fp.monthly),              u: 'kg CO₂', c: C.acc, sub: 'This month'        },
              { l: 'ANNUAL',       v: Math.round(fp.yearly),               u: 'kg CO₂', c: C.org, sub: `${(fp.yearly/1000).toFixed(1)}t/yr`    },
              { l: 'VS INDIA AVG', v: Math.abs(Math.round(fp.monthly-158)),u: 'kg/mo',  c: fp.monthly>158?C.red:C.acc, sub: fp.monthly>158?'above avg':'below avg' },
              { l: 'TRANSPORT',    v: Math.round(fp.transport),            u: 'kg/mo',  c: RC[0], sub: `${Math.round(fp.transport/fp.monthly*100)}% of total` },
              { l: 'ENERGY',       v: Math.round(fp.energy),               u: 'kg/mo',  c: RC[1], sub: `${Math.round(fp.energy/fp.monthly*100)}% of total`    },
              { l: 'ANNUAL COST',  v: fin.yearly,                          u: '₹',      c: C.blu, sub: `~₹${fin.monthly}/mo`  },
            ].map(s => (
              <div key={s.l} style={{ ...K.card, padding: '1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ color: C.dim, fontSize: 9, letterSpacing: '1.5px', fontWeight: 600 }}>{s.l}</div>
                <div style={{ color: s.c, fontSize: '1.45rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px' }}>
                  <AN value={s.v} /><span style={{ fontSize: 11, fontWeight: 500, color: C.mut, marginLeft: 3 }}>{s.u}</span>
                </div>
                <div style={{ color: C.dim, fontSize: 11 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ROW 2: Trend chart + Category split ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginBottom: 14 }}>

          {/* 12-month trend */}
          <div style={{ ...K.card }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <div>
                <div style={{ fontWeight: 700, color: C.txt, fontSize: 14 }}>12-Month Trend</div>
                <div style={{ color: C.mut, fontSize: 12 }}>Monthly kg CO₂</div>
              </div>
              <Chip label={`${Math.round(fp.monthly)} kg this month`} color={C.acc} />
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart data={trend} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.acc} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={C.acc} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: C.mut, fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.mut, fontSize: 10, fontFamily: FONT }} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} />
                <Area type="monotone" dataKey="value" stroke={C.acc} fill="url(#ag)"
                  strokeWidth={2} dot={false} activeDot={{ r: 4, fill: C.acc, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category split */}
          <div style={{ ...K.card }}>
            <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '0.9rem' }}>Category Split</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flexShrink: 0 }}>
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie data={catPie} cx="50%" cy="50%" innerRadius={30} outerRadius={52} paddingAngle={3} dataKey="value">
                      {catPie.map((_, i) => <Cell key={i} fill={RC[i]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {catPie.map(c => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                      <span style={{ color: C.mut, fontSize: 12 }}>{c.name}</span>
                    </div>
                    <span style={{ color: C.txt, fontSize: 12, fontWeight: 700 }}>{c.value} kg</span>
                  </div>
                ))}
              </div>
            </div>
            {/* vs global */}
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${C.bdr}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.mut, marginBottom: 5 }}>
                <span>You: {Math.round(fp.monthly)} kg/mo</span>
                <span>Global avg: 350 kg/mo</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: C.bdr, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2,
                  width: `${Math.min(100, (fp.monthly / 350) * 100)}%`,
                  background: fp.monthly < 350 ? C.acc : C.org, transition: 'width 1.4s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Clock + Daily log + Top actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

          {/* Carbon clock */}
          <CarbonClock yearly={fp.yearly} />

          {/* Daily log */}
          <div style={{ ...K.card }}>
            <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '0.75rem' }}>Log Today</div>
            <div style={{ color: C.mut, fontSize: 12, marginBottom: '0.9rem' }}>Earn XP by tracking your day</div>
            {[
              { k: 'commute', i: '🚌', l: 'Commute'     },
              { k: 'meal',    i: '🥗', l: 'Meals'       },
              { k: 'energy',  i: '⚡', l: 'Home Energy' },
            ].map(a => {
              const done = todayLogs.includes(a.k)
              return (
                <button key={a.k} onClick={() => !done && onLog?.(a.k)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                  background: done ? `${C.acc}10` : 'transparent',
                  border: `1px solid ${done ? C.acc + '35' : C.bdr}`,
                  borderRadius: 8, padding: '9px 11px',
                  cursor: done ? 'default' : 'pointer',
                  color: done ? C.acc : C.txt,
                  fontFamily: FONT, marginBottom: 7, transition: 'all 0.18s',
                }}>
                  <span style={{ fontSize: 17 }}>{a.i}</span>
                  <span style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 500 }}>{a.l}</span>
                  <span style={{ color: done ? C.acc : C.gold, fontSize: 11, fontWeight: 700 }}>
                    {done ? '✓ Done' : '+25 XP'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Top actions */}
          <div style={{ ...K.card }}>
            <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '0.25rem' }}>Quick Wins</div>
            <div style={{ color: C.mut, fontSize: 12, marginBottom: '0.9rem' }}>Your top 3 impact actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actions.map((a, i) => (
                <div key={i} style={{ background: C.surf, border: `1px solid ${C.bdr}`, borderRadius: 9, padding: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                    <span style={{ fontSize: 17, flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ color: C.txt, fontSize: 12, fontWeight: 500, lineHeight: 1.45 }}>{a.a}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <Chip label={`-${a.save} kg/mo`} color={C.acc} />
                    <Chip label={`+${a.xp} XP`}      color={C.gold} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
