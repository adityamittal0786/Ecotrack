import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { C, K } from '../design.js'
import { AN, Page } from '../components/Shared.jsx'

const FONT = "'Space Grotesk', system-ui, sans-serif"
const TIP  = { contentStyle: { background:'#1c1c22', border:'1px solid rgba(194,245,66,0.15)', borderRadius:8, color:'#f1f5f0', fontSize:12, padding:'7px 11px', fontFamily: FONT } }

function sr(s) { const x = Math.sin(s + 1) * 10000; return x - Math.floor(x) }

export default function Progress({ trend, fp, streak }) {
  const weekData = useMemo(() => [
    { day:'Mon', v: Math.round(fp.monthly / 30 * (0.88 + sr(1) * 0.18)) },
    { day:'Tue', v: Math.round(fp.monthly / 30 * (0.85 + sr(2) * 0.18)) },
    { day:'Wed', v: Math.round(fp.monthly / 30 * (0.82 + sr(3) * 0.15)) },
    { day:'Thu', v: Math.round(fp.monthly / 30 * (0.88 + sr(4) * 0.18)) },
    { day:'Fri', v: Math.round(fp.monthly / 30 * (0.95 + sr(5) * 0.18)) },
    { day:'Sat', v: Math.round(fp.monthly / 30 * (1.10 + sr(6) * 0.20)) },
    { day:'Sun', v: Math.round(fp.monthly / 30 * (0.78 + sr(7) * 0.12)) },
  ], [fp.monthly])

  const best = Math.min(...trend.map(t => t.value))
  const avg  = Math.round(trend.reduce((s, t) => s + t.value, 0) / trend.length)

  const kpis = [
    { l:'THIS MONTH',   v: Math.round(fp.monthly), u:'kg', c: C.acc     },
    { l:'BEST MONTH',   v: best,                   u:'kg', c: '#22c55e' },
    { l:'AVG MONTHLY',  v: avg,                    u:'kg', c: C.mut     },
    { l:'YEARLY TOTAL', v: Math.round(fp.yearly),  u:'kg', c: C.org     },
    { l:'STREAK',       v: streak,                 u:'d',  c: C.gold    },
  ]

  const milestones = [
    { i:'🥉', l:'5% reduction',  pct: 5  },
    { i:'🥈', l:'15% reduction', pct: 15 },
    { i:'🥇', l:'30% reduction', pct: 30 },
    { i:'🏆', l:'50% reduction', pct: 50 },
  ]

  return (
    <Page>
      <div style={{ padding:'1.75rem', maxWidth:1100, margin:'0 auto', fontFamily:FONT }}>

        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ color:C.mut, fontSize:10, letterSpacing:'1.5px', marginBottom:4 }}>ANALYTICS</div>
          <h2 style={{ fontFamily:FONT, fontSize:'1.6rem', fontWeight:800, color:C.txt, letterSpacing:'-0.5px' }}>
            Progress<span style={{ color:C.acc }}>.</span>
          </h2>
        </div>

        {/* KPI row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:11, marginBottom:14 }}>
          {kpis.map(s => (
            <div key={s.l} style={{ ...K.card, textAlign:'center', padding:'1rem 0.75rem' }}>
              <div style={{ color:C.dim, fontSize:9, letterSpacing:'1px', marginBottom:4 }}>{s.l}</div>
              <div style={{ color:s.c, fontFamily:FONT, fontWeight:800, fontSize:'1.35rem', lineHeight:1, letterSpacing:'-0.5px' }}>
                <AN value={s.v} /><span style={{ fontSize:10, fontWeight:500, color:C.dim, marginLeft:2 }}>{s.u}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 12-month area chart */}
        <div style={{ ...K.card, marginBottom:14 }}>
          <div style={{ marginBottom:'0.9rem' }}>
            <div style={{ fontWeight:700, color:C.txt, fontSize:14 }}>12-Month History</div>
            <div style={{ color:C.mut, fontSize:12 }}>Monthly kg CO₂ — all categories</div>
          </div>
          <ResponsiveContainer width="100%" height={195}>
            <AreaChart data={trend} margin={{ top:8, right:8, bottom:0, left:-10 }}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.acc} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.acc} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill:C.mut, fontSize:10, fontFamily:FONT }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:C.mut, fontSize:10, fontFamily:FONT }} axisLine={false} tickLine={false} />
              <Tooltip {...TIP} formatter={v => [`${v} kg CO₂`, 'Emissions']} />
              <Area type="monotone" dataKey="value" stroke={C.acc} fill="url(#pg)"
                strokeWidth={2.5} dot={false} activeDot={{ r:4, fill:C.acc, strokeWidth:0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly + Milestones */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>

          {/* Weekly bar */}
          <div style={{ ...K.card }}>
            <div style={{ fontWeight:700, color:C.txt, fontSize:14, marginBottom:'0.25rem' }}>This Week</div>
            <div style={{ color:C.mut, fontSize:12, marginBottom:'0.75rem' }}>Daily emissions (kg CO₂)</div>
            <ResponsiveContainer width="100%" height={145}>
              <BarChart data={weekData} margin={{ top:5, right:5, bottom:0, left:-10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill:C.mut, fontSize:11, fontFamily:FONT }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:C.mut, fontSize:10, fontFamily:FONT }} axisLine={false} tickLine={false} />
                <Tooltip {...TIP} />
                <Bar dataKey="v" fill={C.acc} radius={[4,4,0,0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Milestones */}
          <div style={{ ...K.card }}>
            <div style={{ fontWeight:700, color:C.txt, fontSize:14, marginBottom:'1rem' }}>Reduction Milestones</div>
            {milestones.map(m => {
              const save = Math.round(fp.monthly * m.pct / 100)
              return (
                <div key={m.l} style={{ display:'flex', alignItems:'center', gap:11,
                  padding:'8px 0', borderBottom:`1px solid ${C.bdr}` }}>
                  <span style={{ fontSize:18, opacity:0.3 }}>{m.i}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ color:C.mut, fontSize:13 }}>{m.l}</div>
                    <div style={{ color:C.dim, fontSize:11 }}>
                      Saves {save} kg/mo · ₹{Math.round(save * 14).toLocaleString()}/yr
                    </div>
                  </div>
                  <span style={{ color:C.dim, fontSize:11, fontWeight:600 }}>Pending</span>
                </div>
              )
            })}
            <div style={{ marginTop:'0.75rem', padding:'0.75rem',
              background:`${C.acc}08`, borderRadius:9, border:`1px solid ${C.acc}20` }}>
              <div style={{ color:C.acc, fontSize:12, fontWeight:700, marginBottom:2 }}>Next target</div>
              <div style={{ color:C.mut, fontSize:12 }}>
                Reduce by 5% ({Math.round(fp.monthly * 0.05)} kg/mo) to unlock your first milestone.
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
