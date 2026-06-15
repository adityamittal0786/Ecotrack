import { useState, useMemo } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { C, RC, K } from '../design.js'
import { calcFP } from '../lib/calculations.js'
import { Chip, Page } from '../components/Shared.jsx'

const TIP = { contentStyle: { background:'#1c1c22', border:'1px solid rgba(194,245,66,0.15)', borderRadius:8, color:'#f1f5f0', fontSize:12, padding:'7px 11px', fontFamily:"'Space Grotesk', sans-serif" } }
const FONT = "'Space Grotesk', system-ui, sans-serif"

export default function ImpactSimulator({ userData }) {
  const base = useMemo(() => calcFP(userData), [])
  const [c, setC] = useState({
    pubTrans: 0, acCut: 0, carFree: 0,
    onlinePct: 0, dietShift: userData?.diet || 'vegetarian',
    renewable: false, shortFlights: 0,
  })
  const upd = (k, v) => setC(p => ({ ...p, [k]: v }))

  const sim = useMemo(() => calcFP({
    ...userData,
    car_km:        Math.max(0, (userData?.car_km || 0) * (1 - c.carFree / 7) * (1 - c.pubTrans / 7)),
    bus_km:        (userData?.bus_km || 0) + (userData?.car_km || 0) * (c.pubTrans / 7) * 0.6,
    ac_hours:      Math.max(0, (userData?.ac_hours || 0) - c.acCut),
    electricity:   c.renewable ? (userData?.electricity || 0) * 0.18 : (userData?.electricity || 0),
    diet:          c.dietShift,
    online_orders: Math.max(0, (userData?.online_orders || 0) * (1 - c.onlinePct / 100)),
    flights:       Math.max(0, (userData?.flights || 0) - c.shortFlights),
  }), [c, userData])

  const saved = Math.max(0, base.monthly - sim.monthly)
  const pct   = Math.round((saved / base.monthly) * 100)
  const money = Math.round(saved * 14)
  const chart = [{ n: 'Current', v: Math.round(base.monthly) }, { n: 'After', v: Math.round(sim.monthly) }]
  const cats  = [
    { n: 'Transport', b: Math.round(base.transport), s: Math.round(sim.transport), c: RC[0] },
    { n: 'Energy',    b: Math.round(base.energy),    s: Math.round(sim.energy),    c: RC[1] },
    { n: 'Food',      b: Math.round(base.food),      s: Math.round(sim.food),      c: RC[2] },
    { n: 'Shopping',  b: Math.round(base.shopping),  s: Math.round(sim.shopping),  c: RC[3] },
  ]

  return (
    <Page>
      <div style={{ padding: '1.75rem', maxWidth: 1100, margin: '0 auto', fontFamily: FONT }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: C.mut, fontSize: 10, letterSpacing: '1.5px', marginBottom: 4 }}>SCENARIO MODELLING</div>
          <h2 style={{ fontFamily: FONT, fontSize: '1.6rem', fontWeight: 800, color: C.txt, letterSpacing: '-0.5px' }}>
            Impact Simulator<span style={{ color: C.acc }}>.</span>
          </h2>
          <p style={{ color: C.mut, margin: '0.2rem 0 0', fontSize: 14 }}>
            Adjust your habits. See emission changes instantly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Transport */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '1rem' }}>🚗 Transportation</div>
              {[
                { label: 'Public transit instead of car',  field: 'pubTrans',     min: 0, max: 7, unit: ' days/wk'  },
                { label: 'Car-free days per week',          field: 'carFree',      min: 0, max: 7, unit: ' days/wk'  },
                { label: 'Fewer short-haul flights',        field: 'shortFlights', min: 0, max: Math.max(1, userData?.flights || 4), unit: '/yr' },
              ].map(s => (
                <div key={s.field} style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ color: C.mut, fontSize: 13 }}>{s.label}</label>
                    <span style={{ color: C.acc, fontWeight: 700, fontSize: 14 }}>{c[s.field]}{s.unit}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={1} value={c[s.field]}
                    onChange={e => upd(s.field, Number(e.target.value))} style={{ width: '100%', accentColor: C.acc }} />
                </div>
              ))}
            </div>

            {/* Energy */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '1rem' }}>⚡ Energy & Lifestyle</div>
              {[
                { label: 'Reduce AC usage',      field: 'acCut',     min: 0, max: Math.min(12, userData?.ac_hours || 6), unit: ' hrs/day less' },
                { label: 'Cut online shopping',  field: 'onlinePct', min: 0, max: 80, unit: '%' },
              ].map(s => (
                <div key={s.field} style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ color: C.mut, fontSize: 13 }}>{s.label}</label>
                    <span style={{ color: C.acc, fontWeight: 700, fontSize: 14 }}>{c[s.field]}{s.unit}</span>
                  </div>
                  <input type="range" min={s.min} max={s.max} step={1} value={c[s.field]}
                    onChange={e => upd(s.field, Number(e.target.value))} style={{ width: '100%', accentColor: C.acc }} />
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', color: C.mut, fontSize: 13, userSelect: 'none' }}>
                <input type="checkbox" checked={c.renewable} onChange={e => upd('renewable', e.target.checked)}
                  style={{ accentColor: C.acc, width: 14, height: 14 }} />
                Switch to 80% renewable electricity
              </label>
            </div>

            {/* Diet */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '0.75rem' }}>🥗 Diet Change</div>
              <div style={{ display: 'flex', gap: 7 }}>
                {[['vegan','🌱 Vegan'],['vegetarian','🥗 Veggie'],['nonveg','🍗 Non-Veg']].map(([d, lbl]) => (
                  <button key={d} onClick={() => upd('dietShift', d)} style={{
                    flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer', fontFamily: FONT,
                    border: `1px solid ${c.dietShift === d ? C.acc : C.bdr}`,
                    background: c.dietShift === d ? `${C.acc}12` : 'transparent',
                    color: c.dietShift === d ? C.acc : C.mut,
                    fontWeight: 700, fontSize: 12, transition: 'all 0.18s',
                  }}>{lbl}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Hero number */}
            <div style={{
              ...K.card, textAlign: 'center', padding: '1.75rem 1.25rem',
              border: `1px solid ${saved > 0 ? C.acc + '30' : C.bdr}`,
              background: saved > 0 ? `linear-gradient(135deg, ${C.acc}06, transparent)` : C.card,
              boxShadow: saved > 0 ? `0 0 32px ${C.acc}08` : 'none',
            }}>
              <div style={{ color: C.mut, fontSize: 9, letterSpacing: '2px', marginBottom: 8 }}>MONTHLY CO₂ SAVINGS</div>
              <div style={{ fontFamily: FONT, fontSize: '4rem', fontWeight: 800, color: saved > 0 ? C.acc : C.mut,
                lineHeight: 1, letterSpacing: '-2px',
                filter: saved > 0 ? `drop-shadow(0 0 18px ${C.acc}40)` : 'none' }}>
                {saved > 0 ? '-' : ''}{Math.round(saved)}
              </div>
              <div style={{ color: C.mut, fontSize: 14, marginBottom: '1.1rem' }}>kg CO₂ / month</div>
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
                {pct  > 0 && <Chip label={`-${pct}% emissions`}               color={C.acc}    />}
                {saved > 0 && <Chip label={`🌳 ${Math.round(saved*12/21)} trees/yr`} color="#22c55e" />}
                {money > 0 && <Chip label={`💰 ₹${money.toLocaleString()}/yr`}        color={C.gold}   />}
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight: 600, color: C.txt, fontSize: 13, marginBottom: '0.75rem' }}>Before vs After</div>
              <ResponsiveContainer width="100%" height={115}>
                <BarChart data={chart} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="n" tick={{ fill: C.mut, fontSize: 12, fontFamily: FONT }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: C.mut, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} />
                  <Tooltip {...TIP} />
                  <Bar dataKey="v" radius={[5, 5, 0, 0]}>
                    <Cell fill={C.org} /><Cell fill={C.acc} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category diff */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight: 600, color: C.txt, fontSize: 13, marginBottom: '0.75rem' }}>Category Breakdown</div>
              {cats.map(cat => {
                const diff = cat.b - cat.s
                return (
                  <div key={cat.n} style={{ display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '7px 0', borderBottom: `1px solid ${C.bdr}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.c }} />
                      <span style={{ color: C.mut, fontSize: 13 }}>{cat.n}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ color: C.dim, fontSize: 12 }}>{cat.b}→{cat.s} kg</span>
                      <span style={{ color: diff > 0 ? C.acc : diff < 0 ? C.red : C.mut,
                        fontSize: 12, fontWeight: 700, minWidth: 50, textAlign: 'right' }}>
                        {diff > 0 ? `-${diff}` : diff < 0 ? `+${Math.abs(diff)}` : '—'} kg
                      </span>
                    </div>
                  </div>
                )
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.7rem' }}>
                <span style={{ color: C.mut, fontSize: 13 }}>Annual change</span>
                <span style={{ color: saved > 0 ? C.acc : C.red, fontWeight: 700, fontSize: 14 }}>
                  {saved > 0 ? '-' : ''}{Math.round(saved * 12)} kg CO₂/yr
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
