import { C, K } from '../design.js'
import { getScore } from '../lib/calculations.js'
import { Chip, Page } from '../components/Shared.jsx'

const FONT = "'Space Grotesk', system-ui, sans-serif"

const LB_DATA = [
  { rank:1,  name:'Priya S.',  av:'PS', city:'Bangalore', yearly:780,  score:87, level:'Eco Champion',  streak:63, col:'#c2f542' },
  { rank:2,  name:'Rahul M.',  av:'RM', city:'Hyderabad', yearly:940,  score:84, level:'Eco Champion',  streak:45, col:'#c2f542' },
  { rank:3,  name:'Aisha K.',  av:'AK', city:'Chennai',   yearly:1100, score:82, level:'Green Hero',    streak:38, col:'#86efac' },
  { rank:4,  name:'Dev P.',    av:'DP', city:'Pune',      yearly:1320, score:78, level:'Green Hero',    streak:27, col:'#86efac' },
  { rank:5,  name:'Meera T.',  av:'MT', city:'Kolkata',   yearly:1550, score:74, level:'Earth Friend',  streak:21, col:'#f59e0b' },
  { rank:6,  name:'Arjun B.',  av:'AB', city:'Delhi',     yearly:1820, score:70, level:'Earth Friend',  streak:14, col:'#f59e0b' },
  { rank:7,  name:'Kavya R.',  av:'KR', city:'Ahmedabad', yearly:2050, score:66, level:'Earth Friend',  streak:9,  col:'#f59e0b' },
  { rank:8,  name:'Sid J.',    av:'SJ', city:'Jaipur',    yearly:2300, score:62, level:'Aware Citizen', streak:5,  col:'#fb923c' },
  { rank:9,  name:'Nisha V.',  av:'NV', city:'Lucknow',   yearly:2700, score:55, level:'Aware Citizen', streak:3,  col:'#fb923c' },
  { rank:10, name:'Rohan D.',  av:'RD', city:'Indore',    yearly:3200, score:47, level:'Aware Citizen', streak:1,  col:'#fb923c' },
]

const medal = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : ''

export default function Leaderboard({ fp, userData }) {
  const { score, level, color, xp } = getScore(fp.yearly)

  const insertAt = LB_DATA.findIndex(e => score > e.score)
  const userRank = insertAt === -1 ? LB_DATA.length + 1 : insertAt + 1

  const userRow = {
    rank:   userRank,
    name:   userData?.name || 'You',
    av:     (userData?.name || 'YO').slice(0, 2).toUpperCase(),
    city:   'Your City',
    yearly: Math.round(fp.yearly),
    score, level,
    streak: userData?.streak || 7,
    col:    color,
    isUser: true,
  }

  const all = [...LB_DATA]
  if (insertAt === -1) all.push(userRow)
  else all.splice(insertAt, 0, userRow)

  const stats = [
    { l:'Users',        v:'1,284', i:'◉' },
    { l:'CO₂ Saved',   v:'42.3t', i:'◈' },
    { l:'Trees Offset', v:'3,200+',i:'◆' },
    { l:'Cities',       v:'87',    i:'◑' },
  ]

  return (
    <Page>
      <div style={{ padding:'1.75rem', maxWidth:1000, margin:'0 auto', fontFamily:FONT }}>

        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ color:C.mut, fontSize:10, letterSpacing:'1.5px', marginBottom:4 }}>COMMUNITY</div>
          <h2 style={{ fontFamily:FONT, fontSize:'1.6rem', fontWeight:800, color:C.txt, letterSpacing:'-0.5px' }}>
            Leaderboard<span style={{ color:C.acc }}>.</span>
          </h2>
          <p style={{ color:C.mut, margin:'0.2rem 0 0', fontSize:14 }}>India region · Ranked by Eco Score</p>
        </div>

        {/* Global stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:11, marginBottom:14 }}>
          {stats.map(s => (
            <div key={s.l} style={{ ...K.card, textAlign:'center', padding:'1rem' }}>
              <div style={{ color:C.acc, fontSize:18, marginBottom:4 }}>{s.i}</div>
              <div style={{ fontFamily:FONT, fontWeight:800, fontSize:'1.2rem', color:C.txt, lineHeight:1, letterSpacing:'-0.5px' }}>{s.v}</div>
              <div style={{ color:C.mut, fontSize:11, marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* User position banner */}
        <div style={{ ...K.card, border:`1px solid ${color}35`, background:`${color}06`,
          marginBottom:12, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ fontFamily:FONT, fontSize:'2rem', fontWeight:800, color, letterSpacing:'-1px', minWidth:50 }}>
            #{userRank}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, color:C.txt, marginBottom:2 }}>
              Your position — #{userRank} of {all.length} users
            </div>
            <div style={{ color:C.mut, fontSize:13 }}>
              Score: {score} · {(fp.yearly/1000).toFixed(1)}t CO₂/yr · {level}
            </div>
          </div>
          <Chip color={color} label={level} />
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ color:C.gold, fontFamily:FONT, fontWeight:800, fontSize:'1.35rem', letterSpacing:'-0.5px' }}>⚡{xp}</div>
            <div style={{ color:C.dim, fontSize:10, marginTop:1 }}>XP</div>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...K.card }}>
          <div style={{ fontWeight:700, color:C.txt, fontSize:14, marginBottom:'0.9rem' }}>Rankings</div>

          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'46px 1fr 75px 75px 80px 72px',
            gap:8, padding:'4px 10px', color:C.dim, fontSize:9, letterSpacing:'1px', marginBottom:4 }}>
            <span>RANK</span><span>USER</span>
            <span style={{ textAlign:'center' }}>SCORE</span>
            <span style={{ textAlign:'center' }}>CO₂/YR</span>
            <span style={{ textAlign:'center' }}>STREAK</span>
            <span style={{ textAlign:'right'  }}>LEVEL</span>
          </div>

          {all.map((e, i) => (
            <div key={i} style={{
              display:'grid', gridTemplateColumns:'46px 1fr 75px 75px 80px 72px',
              gap:8, padding:'8px 10px', borderRadius:8, alignItems:'center',
              background: e.isUser ? `${color}10` : i % 2 === 0 ? C.surf : 'transparent',
              border: e.isUser ? `1px solid ${color}25` : '1px solid transparent',
              marginBottom:3, transition:'background 0.15s',
            }}>
              <span style={{ fontFamily:FONT, fontWeight:800, color:e.rank<=3?C.gold:C.mut, fontSize:14 }}>
                {medal(e.rank) || `#${e.rank}`}
              </span>

              <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:`${e.col}18`,
                  border:`1px solid ${e.col}38`, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:10, fontWeight:700, color:e.col, flexShrink:0 }}>
                  {e.av}
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ color:e.isUser?color:C.txt, fontWeight:e.isUser?700:500,
                    fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {e.name}{e.isUser ? ' (you)' : ''}
                  </div>
                  <div style={{ color:C.dim, fontSize:11 }}>{e.city}</div>
                </div>
              </div>

              <div style={{ textAlign:'center', color:e.col, fontWeight:800, fontSize:14, fontFamily:FONT }}>
                {e.score}
              </div>
              <div style={{ textAlign:'center', color:C.mut, fontSize:12 }}>
                {(e.yearly/1000).toFixed(1)}t
              </div>
              <div style={{ textAlign:'center' }}>
                <Chip label={`🔥${e.streak}d`} color={C.gold} />
              </div>
              <div style={{ textAlign:'right' }}>
                <Chip color={e.col} label={e.level.split(' ')[0]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  )
}
