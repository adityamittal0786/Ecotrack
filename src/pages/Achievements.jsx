import { C, K } from '../design.js'
import { Page } from '../components/Shared.jsx'

const FONT = "'Space Grotesk', system-ui, sans-serif"
const RC   = { Common: '#94a3b8', Rare: '#38bdf8', Epic: '#f472b6', Legendary: '#f59e0b' }

const CHALLENGES = [
  { e:'🚌', t:'Transit Week',     d:'Use public transit every day for 5 days', r:100, p:2, tot:5 },
  { e:'🥗', t:'Plant-Based Week', d:'Vegetarian or vegan for 7 days',          r:80,  p:4, tot:7 },
  { e:'❄️', t:'Cool It Down',     d:'Reduce AC by 2h/day for a week',          r:60,  p:0, tot:7 },
  { e:'📦', t:'Delivery Detox',   d:'Zero online deliveries for 7 days',       r:90,  p:1, tot:7 },
]

function buildBadges(fp) {
  return [
    { e:'🌱', n:'First Step',    d:'Calculated your footprint',         earned:true,              xp:50,  r:'Common'    },
    { e:'🚌', n:'Transit Champ', d:'Transport under 80 kg/mo',          earned:fp.transport<80,   xp:150, r:'Rare'      },
    { e:'⚡', n:'Energy Saver',  d:'Energy under 80 kg/mo',             earned:fp.energy<80,      xp:200, r:'Rare'      },
    { e:'🥗', n:'Green Plate',   d:'Plant-based diet',                  earned:fp.food<80,        xp:120, r:'Common'    },
    { e:'🌍', n:'Below Average', d:'Under India avg footprint',         earned:fp.yearly<1900,    xp:250, r:'Rare'      },
    { e:'🏆', n:'Eco Champion',  d:'Reach Eco Champion level',          earned:fp.yearly<1000,    xp:500, r:'Legendary' },
    { e:'🔥', n:'7-Day Streak',  d:'Log activities for 7 days',         earned:false,             xp:100, r:'Common'    },
    { e:'🌳', n:'Tree Planter',  d:'Offset 100 trees/yr equivalent',   earned:fp.yearly<2100,    xp:300, r:'Epic'      },
    { e:'♻️', n:'Zero Waster',   d:'Shopping under 20 kg/mo',          earned:fp.shopping<20,    xp:175, r:'Rare'      },
    { e:'🚲', n:'Cyclist',       d:'Transport under 20 kg/mo',          earned:fp.transport<20,   xp:200, r:'Epic'      },
    { e:'💡', n:'Smart Home',    d:'Energy under 50 kg/mo',             earned:fp.energy<50,      xp:250, r:'Epic'      },
    { e:'🌐', n:'Climate Hero',  d:'Annual footprint within 1.5°C',    earned:fp.yearly<2300,    xp:400, r:'Legendary' },
  ]
}

export default function Achievements({ fp, level, color, xp }) {
  const badges  = buildBadges(fp)
  const earned  = badges.filter(b => b.earned)
  const totalXP = earned.reduce((s, b) => s + b.xp, 0) + xp
  const prog    = Math.min(100, Math.round(((totalXP % 1000) / 1000) * 100))

  return (
    <Page>
      <div style={{ padding: '1.75rem', maxWidth: 1100, margin: '0 auto', fontFamily: FONT }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ color: C.mut, fontSize: 10, letterSpacing: '1.5px', marginBottom: 4 }}>GAMIFICATION</div>
          <h1 style={{ fontFamily: FONT, fontSize: '1.6rem', fontWeight: 800, color: C.txt, letterSpacing: '-0.5px' }}>
            Achievements<span style={{ color: C.acc }}>.</span>
          </h1>
        </div>

        {/* XP card */}
        <div style={{ ...K.card, marginBottom: 14, border: `1px solid ${color}30`,
          background: `linear-gradient(135deg, ${color}05, transparent)` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: `2px solid ${color}`,
                background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, boxShadow: `0 0 18px ${color}28` }}>
                {earned.length > 9 ? '🌟' : earned.length > 5 ? '⭐' : '🌿'}
              </div>
              <div>
                <div style={{ color, fontFamily: FONT, fontWeight: 800, fontSize: '1.1rem' }}>{level}</div>
                <div style={{ color: C.mut, fontSize: 13 }}>{earned.length}/{badges.length} badges · {totalXP.toLocaleString()} XP total</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: C.gold, fontWeight: 800, fontSize: '1.8rem', lineHeight: 1, letterSpacing: '-0.5px' }}>⚡{xp}</div>
              <div style={{ color: C.mut, fontSize: 11, marginTop: 2 }}>Eco Points</div>
            </div>
          </div>
          <div style={{ color: C.mut, fontSize: 11, marginBottom: 5 }}>Level Progress · {prog}%</div>
          <div style={{ height: 5, borderRadius: 3, background: C.bdr, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 3, width: `${prog}%`,
              background: `linear-gradient(90deg, ${C.acc}, ${C.gold})`, transition: 'width 1.4s ease' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14 }}>
          {/* Badge grid */}
          <div style={{ ...K.card }}>
            <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '0.9rem' }}>Badge Collection</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {badges.map(b => (
                <div key={b.n} style={{
                  background: b.earned ? `${RC[b.r]}08` : C.surf,
                  border: `1px solid ${b.earned ? RC[b.r] + '35' : C.bdr}`,
                  borderRadius: 10, padding: '0.9rem 0.7rem', textAlign: 'center',
                  opacity: b.earned ? 1 : 0.38, position: 'relative',
                }}>
                  {b.earned && (
                    <div style={{ position: 'absolute', top: 4, right: 4, background: RC[b.r],
                      borderRadius: 4, padding: '1px 5px', fontSize: 8, color: '#09090b', fontWeight: 700 }}>
                      {b.r.slice(0, 4).toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{b.e}</div>
                  <div style={{ color: b.earned ? C.txt : C.mut, fontWeight: 700, fontSize: 11, marginBottom: 2 }}>{b.n}</div>
                  <div style={{ color: C.dim, fontSize: 9, lineHeight: 1.4, marginBottom: 4 }}>{b.d}</div>
                  <div style={{ color: C.gold, fontSize: 10, fontWeight: 700 }}>+{b.xp} XP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges */}
          <div style={{ ...K.card }}>
            <div style={{ fontWeight: 700, color: C.txt, fontSize: 14, marginBottom: '0.9rem' }}>Active Challenges</div>
            {CHALLENGES.map(ch => {
              const pct = Math.round((ch.p / ch.tot) * 100)
              return (
                <div key={ch.t} style={{ background: C.surf, border: `1px solid ${C.bdr}`,
                  borderRadius: 10, padding: '0.9rem', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{ch.e}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: C.txt, fontSize: 13 }}>{ch.t}</div>
                      <div style={{ color: C.mut, fontSize: 11 }}>{ch.d}</div>
                    </div>
                    <div style={{ color: C.gold, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>+{ch.r} XP</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.mut, marginBottom: 5 }}>
                    <span>{ch.p}/{ch.tot} days</span><span>{pct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: C.bdr, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`,
                      background: C.acc, transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Page>
  )
}
