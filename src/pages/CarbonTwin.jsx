import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { C, RC, K } from '../design.js'
import { getScore } from '../lib/calculations.js'
import { Page } from '../components/Shared.jsx'

const TIP = { contentStyle: { background:'#1c1c22', border:'1px solid rgba(194,245,66,0.15)', borderRadius:8, color:'#f1f5f0', fontSize:12, padding:'7px 11px', fontFamily:"'Space Grotesk', sans-serif" } }
const FONT = "'Space Grotesk', system-ui, sans-serif"

export default function CarbonTwin({ fp }) {
  const y = fp.yearly
  const { color } = getScore(y)

  const eq = [
    { e:'🌳', l:'Trees to offset',       v: Math.round(y/21).toLocaleString(),           u:'trees/yr',      d:'1 tree ≈ 21 kg CO₂/yr',          c: RC[0] },
    { e:'🚗', l:'Car distance driven',    v: Math.round(y/0.21).toLocaleString(),          u:'km',            d:'Average petrol car',               c: RC[1] },
    { e:'📱', l:'Smartphone charges',     v: Math.round(y/0.008).toLocaleString(),         u:'full charges',  d:'8g CO₂ per charge',                c: RC[2] },
    { e:'✈️', l:'Delhi → Mumbai',         v: (y/255).toFixed(1),                           u:'one-way',       d:'≈ 255 kg CO₂ each',                c: RC[3] },
    { e:'🏠', l:'Household energy days',  v: Math.round(y/(4*0.82)).toLocaleString(),      u:'days powered',  d:'Avg Indian home 4 kWh/day',        c: C.acc  },
    { e:'🥩', l:'Beef burger equiv.',     v: Math.round(y/3).toLocaleString(),             u:'burgers',       d:'≈ 3 kg CO₂ per burger',            c: C.org  },
    { e:'💡', l:'LED bulb hours',         v: Math.round(y/0.0042).toLocaleString(),        u:'hours lit',     d:'10W LED on India grid',            c: C.gold },
    { e:'🌊', l:'Arctic ice melted',      v: Math.round(y*3).toLocaleString(),             u:'kg of ice',     d:'≈ 3 kg ice per kg CO₂',            c: C.blu  },
  ]

  const countries = [
    { c:'You',       v: +(y/1000).toFixed(1), col: color  },
    { c:'India avg', v: 1.9,                   col: RC[0]  },
    { c:'Global',    v: 4.2,                   col: RC[2]  },
    { c:'UK',        v: 5.0,                   col: RC[3]  },
    { c:'Germany',   v: 7.9,                   col: C.gold },
    { c:'USA',       v: 14.5,                  col: C.red  },
  ]

  const diff = y - 1900

  return (
    <Page>
      <div style={{ padding: '1.75rem', maxWidth: 1100, margin: '0 auto', fontFamily: FONT }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: C.mut, fontSize: 10, letterSpacing: '1.5px', marginBottom: 4 }}>IMPACT TRANSLATION</div>
          <h2 style={{ fontFamily: FONT, fontSize: '1.6rem', fontWeight: 800, color: C.txt, letterSpacing: '-0.5px' }}>
            Carbon Twin<span style={{ color: C.acc }}>.</span>
          </h2>
          <p style={{ color: C.mut, margin: '0.2rem 0 0', fontSize: 14 }}>
            Your {(y/1000).toFixed(1)}t CO₂/year in things you can picture.
          </p>
        </div>

        {/* Context banner */}
        <div style={{ ...K.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.25rem',
          border: `1px solid ${diff > 0 ? C.org + '40' : C.acc + '30'}`,
          background: diff > 0 ? 'rgba(249,115,22,0.04)' : 'rgba(194,245,66,0.03)' }}>
          <div>
            <div style={{ fontWeight: 700, color: C.txt, marginBottom: 4 }}>
              You emit {diff > 0 ? `${Math.round(diff)} kg MORE` : `${Math.round(-diff)} kg LESS`} CO₂/year than the average Indian
            </div>
            <div style={{ color: C.mut, fontSize: 13 }}>
              You: {(y/1000).toFixed(1)}t · India: 1.9t · World: 4.2t · 1.5°C: 2.3t/yr
            </div>
          </div>
          <div style={{ fontFamily: FONT, fontSize: '2rem', fontWeight: 800,
            color: diff > 0 ? C.org : C.acc, letterSpacing: '-1px', lineHeight: 1, flexShrink: 0 }}>
            {diff > 0 ? '+' : '-'}{Math.abs(diff / 1000).toFixed(2)}t
          </div>
        </div>

        {/* Equivalents grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 11, marginBottom: 16 }}>
          {eq.map(e => (
            <div key={e.l} style={{ ...K.card, textAlign: 'center', padding: '1.1rem 0.9rem', borderLeft: `3px solid ${e.c}` }}>
              <div style={{ fontSize: 30, marginBottom: '0.5rem' }}>{e.e}</div>
              <div style={{ fontFamily: FONT, fontSize: '1.2rem', fontWeight: 800, color: e.c, marginBottom: 2, letterSpacing: '-0.5px' }}>
                {e.v}
              </div>
              <div style={{ color: C.txt, fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{e.u}</div>
              <div style={{ color: C.dim, fontSize: 9, lineHeight: 1.5, marginBottom: 4 }}>{e.l}</div>
              <div style={{ color: C.dim, fontSize: 9, paddingTop: 4, borderTop: `1px solid ${C.bdr}` }}>{e.d}</div>
            </div>
          ))}
        </div>

        {/* Country comparison */}
        <div style={{ ...K.card }}>
          <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '1rem' }}>
            Global Comparison (tonnes CO₂/person/year)
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={countries} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: C.mut, fontSize: 11, fontFamily: FONT }} axisLine={false} tickLine={false} />
              <YAxis dataKey="c" type="category" tick={{ fill: C.mut, fontSize: 12, fontFamily: FONT }} axisLine={false} tickLine={false} width={65} />
              <Tooltip {...TIP} formatter={v => [`${v}t CO₂/yr`, 'Emissions']} />
              <Bar dataKey="v" radius={[0, 5, 5, 0]}>
                {countries.map((d, i) => <Cell key={i} fill={d.col} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Page>
  )
}
