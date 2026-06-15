import { useState, useEffect, useRef } from 'react'
import { C, RC } from '../design.js'
import { useCountUp } from '../hooks/useCountUp.js'
import { BUDGET } from '../lib/calculations.js'

// ─── Score rings — fixed-size, no outside legend ──────────────────────────────
// Renders entirely within viewBox, legend is internal to the card
export function ScoreRings({ fp, score, color, size = 220 }) {
  const [on, setOn] = useState(false)
  useEffect(() => { const t = setTimeout(() => setOn(true), 300); return () => clearTimeout(t) }, [])

  const cx = 110, cy = 110
  const perCat = BUDGET / 12 / 4  // 47.9 kg / category / month

  const rings = [
    { label: 'Transport', val: fp.transport, r: 90, sw: 11, col: RC[0] },
    { label: 'Energy',    val: fp.energy,    r: 74, sw: 11, col: RC[1] },
    { label: 'Food',      val: fp.food,      r: 58, sw: 11, col: RC[2] },
    { label: 'Shopping',  val: fp.shopping,  r: 42, sw: 11, col: RC[3] },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <svg viewBox="0 0 220 220" width={size} height={size} style={{ overflow: 'visible', flexShrink: 0 }}>
        {/* Track rings */}
        {rings.map(r => (
          <circle key={r.label + 't'} cx={cx} cy={cy} r={r.r}
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={r.sw} />
        ))}

        {/* Filled arcs */}
        {rings.map((r, i) => {
          const pct  = on ? Math.min(1.05, r.val / perCat) : 0
          const circ = 2 * Math.PI * r.r
          const dash = Math.min(pct * circ, circ)
          const col  = pct > 1 ? C.red : r.col
          return (
            <circle key={r.label + 'f'} cx={cx} cy={cy} r={r.r}
              fill="none" stroke={col} strokeWidth={r.sw} strokeLinecap="round"
              strokeDasharray={`${dash} ${circ}`}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{
                transition: `stroke-dasharray 1.6s cubic-bezier(0.34,1.4,0.64,1) ${i * 0.12}s`,
                filter: `drop-shadow(0 0 4px ${col}55)`,
              }}
            />
          )
        })}

        {/* Center */}
        <circle cx={cx} cy={cy} r={28} fill={C.bg} />
        <text x={cx} y={cy - 4} textAnchor="middle" fill={color}
          fontSize="22" fontWeight="800" fontFamily="'Space Grotesk', sans-serif"
          style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}>
          {score}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle"
          fill="rgba(241,245,240,0.35)" fontSize="7" letterSpacing="2" fontFamily="'Space Grotesk', sans-serif">
          SCORE
        </text>
      </svg>

      {/* Legend — inside the card, below the SVG, not overlapping anything */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px', width: '100%', maxWidth: 200 }}>
        {rings.map(r => {
          const pct = Math.min(100, Math.round(r.val / perCat * 100))
          return (
            <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: pct > 100 ? C.red : r.col, flexShrink: 0 }} />
              <div>
                <div style={{ color: C.mut, fontSize: 10, lineHeight: 1 }}>{r.label}</div>
                <div style={{ color: pct > 100 ? C.red : C.txt, fontSize: 11, fontWeight: 700 }}>{pct}%</div>
              </div>
            </div>
          )
        })}
        <div style={{ gridColumn: 'span 2', color: C.dim, fontSize: 9, marginTop: 2 }}>
          % of monthly 1.5°C share per category
        </div>
      </div>
    </div>
  )
}

// ─── Animated counting number ─────────────────────────────────────────────────
export function AN({ value, prefix = '', suffix = '' }) {
  const v = useCountUp(value)
  return <span>{prefix}{v.toLocaleString()}{suffix}</span>
}

// ─── Inline badge / chip ──────────────────────────────────────────────────────
export function Chip({ label, color = C.acc }) {
  return (
    <span style={{
      background: `${color}18`, border: `1px solid ${color}38`, color,
      borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ─── Toast notifications ──────────────────────────────────────────────────────
export function Toasts({ items }) {
  return (
    <div style={{ position: 'fixed', top: 68, right: 14, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
      {items.map(t => (
        <div key={t.id} style={{
          background: t.ok ? 'rgba(194,245,66,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${t.ok ? '#c2f54240' : '#ef444440'}`,
          borderRadius: 9, padding: '8px 14px', color: C.txt,
          fontSize: 13, fontWeight: 500, animation: 'toastIn 0.3s ease',
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {t.ok ? '✓' : '✕'} {t.msg}
        </div>
      ))}
    </div>
  )
}

// ─── Live carbon clock ────────────────────────────────────────────────────────
export function CarbonClock({ yearly }) {
  const perSec = yearly / (365 * 24 * 3600)
  const [sec, setSec] = useState(0)
  const start = useRef(Date.now())
  useEffect(() => {
    const id = setInterval(() => setSec((Date.now() - start.current) / 1000), 100)
    return () => clearInterval(id)
  }, [])
  const todaySecs = (() => {
    const n = new Date()
    return n.getHours() * 3600 + n.getMinutes() * 60 + n.getSeconds() + sec % 1
  })()
  const val    = (perSec * todaySecs).toFixed(3)
  const dayPct = Math.min(100, (todaySecs / 86400) * 100)

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(239,68,68,0.07), rgba(249,115,22,0.04))',
      border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '1.1rem',
      textAlign: 'center',
    }}>
      <div style={{ color: 'rgba(239,68,68,0.65)', fontSize: 9, letterSpacing: '2px', marginBottom: 6, fontWeight: 600 }}>
        YOUR EMISSIONS TODAY
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.9rem', fontWeight: 800,
        color: C.red, letterSpacing: '-1px', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.35))' }}>
        {val}
      </div>
      <div style={{ color: C.mut, fontSize: 11, marginTop: 4 }}>kg CO₂ · live</div>
      <div style={{ margin: '8px 0 0', height: 3, borderRadius: 2, background: 'rgba(239,68,68,0.12)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, width: `${dayPct}%`,
          background: 'linear-gradient(90deg,#f97316,#ef4444)', transition: 'width 0.1s linear' }} />
      </div>
      <div style={{ color: C.dim, fontSize: 9, marginTop: 3 }}>
        {dayPct.toFixed(1)}% of daily quota used
      </div>
    </div>
  )
}

// ─── Page enter animation wrapper ────────────────────────────────────────────
export function Page({ children }) {
  return (
    <div style={{ animation: 'pageIn 0.3s ease forwards' }}>
      {children}
    </div>
  )
}
