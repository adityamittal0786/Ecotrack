import { useState } from 'react'
import { C, RC, K } from '../design.js'
import { calcMoney } from '../lib/calculations.js'
import { ScoreRings, Chip, Page } from '../components/Shared.jsx'

const FONT = "'Space Grotesk', system-ui, sans-serif"

export default function Settings({ userData, fp, score, level, color, onUpdate, onRecalculate }) {
  const [name,  setName]  = useState(userData?.name  || '')
  const [diet,  setDiet]  = useState(userData?.diet  || 'vegetarian')
  const [saved, setSaved] = useState(false)
  const fin     = calcMoney(fp)
  const isDirty = name !== (userData?.name || '') || diet !== (userData?.diet || 'vegetarian')

  const save = async () => {
    await onUpdate?.({ name, diet })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const breakdown = [
    { l:'Transport', v: Math.round(fp.transport), c: RC[0] },
    { l:'Energy',    v: Math.round(fp.energy),    c: RC[1] },
    { l:'Food',      v: Math.round(fp.food),       c: RC[2] },
    { l:'Shopping',  v: Math.round(fp.shopping),   c: RC[3] },
  ]

  return (
    <Page>
      <div style={{ padding:'1.75rem', maxWidth:820, margin:'0 auto', fontFamily:FONT }}>

        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ color:C.mut, fontSize:10, letterSpacing:'1.5px', marginBottom:4 }}>ACCOUNT</div>
          <h1 style={{ fontFamily:FONT, fontSize:'1.6rem', fontWeight:800, color:C.txt, letterSpacing:'-0.5px' }}>
            Settings<span style={{ color:C.acc }}>.</span>
          </h1>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

          {/* Left column */}
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>

            {/* Profile */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight:700, color:C.txt, fontSize:14, marginBottom:'1.1rem' }}>Profile</div>
              <div style={{ marginBottom:'0.9rem' }}>
                <label htmlFor="settings-name" style={{ color:C.mut, fontSize:11, display:'block', marginBottom:6, letterSpacing:'0.5px' }}>
                  YOUR NAME
                </label>
                <input id="settings-name" value={name} onChange={e => setName(e.target.value)} style={{ ...K.input }} />
              </div>
              <div style={{ marginBottom:'1.1rem' }}>
                <div id="settings-diet-label" style={{ color:C.mut, fontSize:11, display:'block', marginBottom:6, letterSpacing:'0.5px' }}>
                  DIET TYPE
                </div>
                <div role="radiogroup" aria-labelledby="settings-diet-label" style={{ display:'flex', gap:7 }}>
                  {[['vegan','🌱 Vegan'],['vegetarian','🥗 Veggie'],['nonveg','🍗 Non-Veg']].map(([d,lbl]) => (
                    <button key={d} role="radio" aria-checked={diet===d} onClick={() => setDiet(d)} style={{
                      flex:1, padding:'9px 0', borderRadius:8, cursor:'pointer', fontFamily:FONT,
                      border:`1px solid ${diet===d ? C.acc : C.bdr}`,
                      background: diet===d ? `${C.acc}12` : 'transparent',
                      color: diet===d ? C.acc : C.mut,
                      fontWeight:700, fontSize:12, transition:'all 0.15s',
                    }}>{lbl}</button>
                  ))}
                </div>
              </div>
              <button onClick={save} style={{ ...K.btn(true), width:'100%', padding:'11px', opacity: isDirty ? 1 : 0.4 }}>
                {saved ? '✓ Saved' : 'Save Changes'}
              </button>
            </div>

            {/* ── Recalculate footprint ── */}
            <div style={{ ...K.card,
              border:`1px solid ${C.acc}30`,
              background:`linear-gradient(135deg, ${C.acc}06, transparent)` }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'0.6rem' }}>
                <span style={{ fontSize:24 }}>🔄</span>
                <div>
                  <div style={{ fontWeight:700, color:C.txt, fontSize:14 }}>Recalculate Footprint</div>
                  <div style={{ color:C.mut, fontSize:12 }}>Updated your lifestyle? Get fresh results.</div>
                </div>
              </div>
              <p style={{ color:C.mut, fontSize:13, lineHeight:1.65, marginBottom:'1rem' }}>
                Changed your commute, diet, or home energy habits? Redo the questionnaire anytime to update your score, trend data, and recommendations.
              </p>
              <button onClick={onRecalculate} style={{ ...K.btn(true), width:'100%', padding:'11px' }}>
                Recalculate My Footprint →
              </button>
            </div>

            {/* About */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight:700, color:C.txt, fontSize:14, marginBottom:'0.75rem' }}>About</div>
              <div style={{ color:C.mut, fontSize:13, lineHeight:1.65 }}>
                Emission factors from IPCC, IEA, and India's Central Electricity Authority 2024. All calculations are per-capita estimates.
              </div>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:'0.75rem' }}>
                <Chip label="v3.0"       color={C.acc}  />
                <Chip label="IPCC Data"  color={C.gold} />
                <Chip label="Open Source"color={C.mut}  />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:13 }}>

            {/* Footprint card */}
            <div style={{ ...K.card, border:`1px solid ${color}22` }}>
              <div style={{ fontWeight:700, color:C.txt, fontSize:14, marginBottom:'1rem' }}>Your Footprint</div>

              <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'1rem' }}>
                {/* Small rings — self contained, no overflow */}
                <div style={{ flexShrink:0 }}>
                  <ScoreRings fp={fp} score={score} color={color} size={130} />
                </div>
                <div>
                  <div style={{ color:C.mut, fontSize:11, marginBottom:2 }}>Annual total</div>
                  <div style={{ color, fontFamily:FONT, fontWeight:800, fontSize:'1.4rem', letterSpacing:'-0.5px' }}>
                    {(fp.yearly/1000).toFixed(1)}t CO₂
                  </div>
                  <div style={{ color:C.mut, fontSize:12, marginTop:2 }}>Monthly: {Math.round(fp.monthly)} kg</div>
                  <div style={{ marginTop:7 }}><Chip color={color} label={level} /></div>
                </div>
              </div>

              {breakdown.map(b => (
                <div key={b.l} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                    <span style={{ color:C.mut }}>{b.l}</span>
                    <span style={{ color:b.c, fontWeight:700 }}>
                      {b.v} kg/mo ({Math.round(b.v/fp.monthly*100)}%)
                    </span>
                  </div>
                  <div style={{ height:4, borderRadius:2, background:C.bdr, overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:2,
                      width:`${Math.round(b.v/fp.monthly*100)}%`,
                      background:b.c, transition:'width 1s ease' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Financial */}
            <div style={{ ...K.card }}>
              <div style={{ fontWeight:700, color:C.txt, fontSize:14, marginBottom:'0.75rem' }}>Financial Impact</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:'0.75rem' }}>
                {[
                  { l:'MONTHLY COST', v:`₹${fin.monthly.toLocaleString()}`, c:C.blu },
                  { l:'YEARLY COST',  v:`₹${(fin.yearly/1000).toFixed(1)}k`,  c:C.org },
                ].map(s => (
                  <div key={s.l} style={{ background:C.surf, borderRadius:8, padding:'0.8rem', textAlign:'center' }}>
                    <div style={{ color:C.dim, fontSize:9, letterSpacing:'1px', marginBottom:3 }}>{s.l}</div>
                    <div style={{ color:s.c, fontFamily:FONT, fontWeight:800, fontSize:'1.2rem', letterSpacing:'-0.5px' }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'0.7rem', background:`${C.acc}08`, borderRadius:8, border:`1px solid ${C.acc}20` }}>
                <div style={{ color:C.acc, fontSize:12, fontWeight:700, marginBottom:2 }}>Potential saving</div>
                <div style={{ color:C.mut, fontSize:12 }}>
                  A 20% reduction could save ~₹{Math.round(fin.yearly*0.2).toLocaleString()}/year.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}
