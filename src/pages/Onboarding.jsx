import { useState } from 'react'
import { C, K } from '../design.js'
import { calcFP, getScore } from '../lib/calculations.js'
import { ScoreRings } from '../components/Shared.jsx'

const STEPS = [
  {
    title: 'Transportation',
    sub:   'How far do you travel each week?',
    icon:  '🚗',
    tint:  'rgba(194,245,66,0.04)',
    fields: [
      { key: 'carKm',    label: 'Car',           unit: 'km/week',   max: 500, def: 60 },
      { key: 'busKm',    label: 'Bus',           unit: 'km/week',   max: 200, def: 15 },
      { key: 'trainKm',  label: 'Train',         unit: 'km/week',   max: 300, def: 0  },
      { key: 'metroKm',  label: 'Metro',         unit: 'km/week',   max: 100, def: 10 },
      { key: 'flights',  label: 'Flights/year',  unit: 'flights',   max: 30,  def: 2  },
    ],
  },
  {
    title: 'Home Energy',
    sub:   'Tell us about your electricity, AC and gas use',
    icon:  '⚡',
    tint:  'rgba(245,158,11,0.04)',
    fields: [
      { key: 'electricity', label: 'Electricity', unit: 'kWh/month', max: 800, def: 200 },
      { key: 'acHours',     label: 'AC per day',  unit: 'hrs/day',   max: 16,  def: 5   },
      { key: 'gas',         label: 'Gas',         unit: 'units/mo',  max: 100, def: 12  },
    ],
  },
  {
    title: 'Food & Shopping',
    sub:   'Diet, clothing, devices and deliveries',
    icon:  '🌿',
    tint:  'rgba(56,189,248,0.04)',
    fields: [
      { key: 'clothing',    label: 'Clothing/year', unit: 'items',    max: 50,  def: 12 },
      { key: 'electronics', label: 'Devices/year',  unit: 'items',    max: 10,  def: 1  },
      { key: 'online',      label: 'Online orders', unit: 'per week', max: 20,  def: 3  },
    ],
  },
]

function defaults() {
  const d = {}
  STEPS.forEach(s => s.fields.forEach(f => { d[f.key] = f.def }))
  return d
}

export default function Onboarding({ onComplete, isRecalculate = false }) {
  const [step,   setStep]   = useState(-1)
  const [name,   setName]   = useState('')
  const [diet,   setDiet]   = useState('vegetarian')
  const [vals,   setVals]   = useState(defaults)
  const [saving, setSaving] = useState(false)

  const fp  = calcFP({ ...vals, diet })
  const upd = (k, v) => setVals(p => ({ ...p, [k]: Number(v) }))

  // ── Welcome / start screen ────────────────────────────────────────────────
  if (step === -1) return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', fontFamily: "'Space Grotesk', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 25% 55%, rgba(194,245,66,0.05), transparent 55%)' }} />

      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1,
        animation: 'fadeUp 0.55s ease' }}>
        <div style={{ fontSize: 56, marginBottom: '1.25rem', filter: 'drop-shadow(0 0 20px rgba(194,245,66,0.35))', lineHeight: 1 }}>
          🌍
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem,5vw,3rem)',
          fontWeight: 800, color: C.txt, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '0.75rem' }}>
          {isRecalculate ? 'Recalculate your' : 'Know your'}<br />
          <span style={{ color: C.acc }}>carbon footprint.</span>
        </h1>
        <p style={{ color: C.mut, fontSize: '0.95rem', lineHeight: 1.75, marginBottom: '2rem' }}>
          {isRecalculate
            ? 'Update your lifestyle data and get fresh insights.'
            : '2 minutes. Your complete footprint. Actionable insights.'}
        </p>

        {!isRecalculate && (
          <div>
            <label htmlFor="onboard-name" className="sr-only">Your name</label>
            <input
              id="onboard-name"
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(0)}
              placeholder="Your name to begin"
              style={{ ...K.input, marginBottom: 10, fontSize: 15, padding: '13px 16px' }}
            />
          </div>
        )}

        <button
          onClick={() => (isRecalculate || name.trim()) && setStep(0)}
          style={{
            ...K.btn(true), width: '100%', padding: '13px', fontSize: 15,
            opacity: (isRecalculate || name.trim()) ? 1 : 0.4,
          }}>
          {isRecalculate ? 'Start Recalculating →' : 'Calculate My Footprint →'}
        </button>

        {!isRecalculate && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', marginTop: '1.75rem' }}>
            {[['1,284', 'Users'], ['500t', 'CO₂ Saved'], ['50+', 'Countries']].map(([n, l]) => (
              <div key={l}>
                <div style={{ color: C.acc, fontWeight: 800, fontSize: '1rem' }}>{n}</div>
                <div style={{ color: C.dim, fontSize: 11, marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── Results screen ────────────────────────────────────────────────────────
  if (step === STEPS.length) {
    const { score, level, color, xp } = getScore(fp.yearly)
    const budgetDay  = Math.round((2300 / fp.yearly) * 365)
    const budgetDate = new Date(new Date().getFullYear(), 0, budgetDay)
      .toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })

    const handleDone = async () => {
      setSaving(true)
      await onComplete({ name, diet, ...vals })
      setSaving(false)
    }

    return (
      <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '2rem', fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 500, width: '100%', animation: 'fadeUp 0.45s ease' }}>
          <p style={{ color: C.mut, fontSize: 13, marginBottom: '0.5rem', textAlign: 'center' }}>
            {isRecalculate ? 'Updated results' : `Results for ${name}`} 🌍
          </p>

          {/* Score rings */}
          <div style={{ ...K.card, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '1.5rem', marginBottom: '1rem', border: `1px solid ${color}28`,
            background: `linear-gradient(135deg, ${color}06, transparent)` }}>
            <ScoreRings fp={fp} score={score} color={color} size={200} />
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, fontSize: '1.5rem', color, letterSpacing: '-0.5px' }}>
                {(fp.yearly / 1000).toFixed(1)}t
              </span>
              <span style={{ color: C.mut, fontSize: 14 }}>CO₂/year · India avg: 1.9t</span>
            </div>
          </div>

          {/* Category cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: '0.9rem' }}>
            {[
              { l: 'Transport', v: fp.transport, c: '#c2f542' },
              { l: 'Energy',    v: fp.energy,    c: '#f59e0b' },
              { l: 'Food',      v: fp.food,      c: '#38bdf8' },
              { l: 'Shopping',  v: fp.shopping,  c: '#f472b6' },
            ].map(cat => (
              <div key={cat.l} style={{ ...K.card, padding: '0.85rem', borderLeft: `3px solid ${cat.c}` }}>
                <div style={{ color: C.mut, fontSize: 10, marginBottom: 1 }}>{cat.l}</div>
                <div style={{ color: C.txt, fontWeight: 700, fontSize: 15 }}>
                  {Math.round(cat.v)}<span style={{ fontSize: 11, fontWeight: 500, color: C.mut }}> kg/mo</span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: '1.1rem' }}>
            <div style={{ ...K.card, padding: '0.8rem', textAlign: 'center' }}>
              <div style={{ color: C.mut, fontSize: 9, letterSpacing: '1px', marginBottom: 3 }}>XP EARNED</div>
              <div style={{ color: C.gold, fontWeight: 800, fontSize: '1.2rem' }}>⚡{xp}</div>
            </div>
            <div style={{ ...K.card, padding: '0.8rem', textAlign: 'center' }}>
              <div style={{ color: C.mut, fontSize: 9, letterSpacing: '1px', marginBottom: 3 }}>ECO LEVEL</div>
              <div style={{ color, fontWeight: 700, fontSize: '0.85rem' }}>{level}</div>
            </div>
            <div style={{ ...K.card, padding: '0.8rem', textAlign: 'center',
              border: `1px solid ${fp.yearly > 2300 ? C.org + '40' : C.acc + '30'}` }}>
              <div style={{ color: C.mut, fontSize: 9, letterSpacing: '1px', marginBottom: 3 }}>1.5°C BUDGET</div>
              <div style={{ color: fp.yearly > 2300 ? C.org : C.acc, fontWeight: 700, fontSize: '0.85rem' }}>
                {fp.yearly > 2300 ? `Ends ${budgetDate}` : '✓ Safe'}
              </div>
            </div>
          </div>

          <button onClick={handleDone} disabled={saving}
            style={{ ...K.btn(true), width: '100%', padding: '13px', fontSize: 15, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving···' : isRecalculate ? 'Update Dashboard →' : 'Open Dashboard →'}
          </button>
        </div>
      </div>
    )
  }

  // ── Questionnaire step ────────────────────────────────────────────────────
  const cur = STEPS[step]

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', fontFamily: "'Space Grotesk', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: cur.tint, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 520, width: '100%', position: 'relative', animation: 'pageIn 0.3s ease' }}>
        {/* Progress */}
        <div role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}
          aria-label={`Step ${step + 1} of ${STEPS.length}: ${cur.title}`}
          style={{ display: 'flex', gap: 5, marginBottom: '2.25rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} aria-hidden="true" style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i < step ? 'rgba(194,245,66,0.75)' : i === step ? C.acc : C.bdr,
              transition: 'background 0.35s',
              boxShadow: i === step ? `0 0 6px ${C.acc}55` : 'none',
            }} />
          ))}
        </div>

        <div style={{ fontSize: 38, marginBottom: '0.6rem' }}>{cur.icon}</div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.75rem', fontWeight: 800,
          color: C.txt, marginBottom: '0.3rem', letterSpacing: '-0.5px' }}>
          {cur.title}
        </h2>
        <p style={{ color: C.mut, marginBottom: '1.5rem', fontSize: 14 }}>{cur.sub}</p>

        {/* Diet selector on final step */}
        {step === 2 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div id="diet-label" style={{ color: C.mut, fontSize: 10, letterSpacing: '1.5px', marginBottom: 8, fontWeight: 600 }}>DIET</div>
            <div role="radiogroup" aria-labelledby="diet-label" style={{ display: 'flex', gap: 7 }}>
              {[['vegan', '🌱 Vegan'], ['vegetarian', '🥗 Veggie'], ['nonveg', '🍗 Non-Veg']].map(([d, lbl]) => (
                <button key={d} role="radio" aria-checked={diet === d} onClick={() => setDiet(d)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  border: `1px solid ${diet === d ? C.acc : C.bdr}`,
                  background: diet === d ? `${C.acc}12` : 'transparent',
                  color: diet === d ? C.acc : C.mut,
                  fontWeight: 700, fontSize: 13, transition: 'all 0.18s',
                }}>{lbl}</button>
              ))}
            </div>
          </div>
        )}

        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: '1.75rem' }}>
          {cur.fields.map(f => {
            const inputId = `onboard-${f.key}`
            return (
              <div key={f.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <label htmlFor={inputId} style={{ color: C.mut, fontSize: 13 }}>{f.label}</label>
                  <span style={{ color: C.acc, fontWeight: 800, fontSize: 15 }}>
                    {vals[f.key]}<span style={{ fontSize: 11, fontWeight: 500, color: C.dim, marginLeft: 3 }}>{f.unit}</span>
                  </span>
                </div>
                <input id={inputId} type="range" min={0} max={f.max} step={1} value={vals[f.key]}
                  aria-valuetext={`${vals[f.key]} ${f.unit}`}
                  onChange={e => upd(f.key, e.target.value)} style={{ width: '100%', accentColor: C.acc }} />
              </div>
            )
          })}
        </div>

        {/* Live estimate */}
        <div style={{ ...K.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.25rem', padding: '0.9rem 1.1rem', background: C.surf }}>
          <span style={{ color: C.mut, fontSize: 13 }}>Running estimate</span>
          <span style={{ color: C.acc, fontWeight: 800, fontSize: 16 }}>
            {Math.round(fp.monthly)}<span style={{ fontSize: 12, fontWeight: 500 }}> kg CO₂/mo</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ ...K.btn(false), flex: 1, padding: '12px' }}>
              ← Back
            </button>
          )}
          <button onClick={() => setStep(s => s + 1)} style={{ ...K.btn(true), flex: 2, padding: '12px', fontSize: 15 }}>
            {step === STEPS.length - 1 ? 'See Results →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
