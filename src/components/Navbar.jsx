import { C } from '../design.js'

const NAV = [
  { id: 'dashboard',    label: 'Dashboard'   },
  { id: 'simulator',    label: 'Simulator'   },
  { id: 'twin',         label: 'Carbon Twin' },
  { id: 'achievements', label: 'Badges'      },
  { id: 'progress',     label: 'Progress'    },
  { id: 'leaderboard',  label: 'Leaderboard' },
  { id: 'settings',     label: 'Settings'    },
]

export default function Navbar({ page, setPage, userName, xp, streak }) {
  return (
    <nav style={{
      background:    'rgba(9,9,11,0.94)',
      borderBottom:  `1px solid ${C.bdr}`,
      backdropFilter:'blur(14px)',
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      padding:       '0 1.5rem',
      position:      'sticky',
      top:           0,
      zIndex:        100,
      gap:           10,
      minHeight:     54,
    }}>
      {/* Logo */}
      <div style={{
        fontFamily:    "'Space Grotesk', sans-serif",
        fontWeight:    800,
        fontSize:      '1rem',
        letterSpacing: '-0.5px',
        color:         C.acc,
        flexShrink:    0,
        filter:        'drop-shadow(0 0 6px rgba(194,245,66,0.28))',
      }}>
        ECOTRACK
      </div>

      {/* Links */}
      <div className="eco-nav" style={{ display: 'flex', gap: 2, overflowX: 'auto', flexShrink: 1 }}>
        {NAV.map(item => {
          const active = page === item.id
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              padding:       '5px 11px',
              borderRadius:  7,
              border:        'none',
              fontFamily:    "'Space Grotesk', sans-serif",
              whiteSpace:    'nowrap',
              background:    active ? `${C.acc}14` : 'transparent',
              color:         active ? C.acc : C.mut,
              fontWeight:    active ? 700 : 500,
              fontSize:      12.5,
              cursor:        'pointer',
              borderBottom:  `2px solid ${active ? C.acc : 'transparent'}`,
              transition:    'all 0.15s',
            }}>
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <span style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.22)',
          borderRadius: 7, padding: '3px 9px', fontSize: 12, color: C.gold, fontWeight: 700 }}>
          🔥{streak}d
        </span>
        <span style={{ background: `${C.acc}10`, border: `1px solid ${C.acc}25`,
          borderRadius: 7, padding: '3px 9px', fontSize: 12, color: C.acc, fontWeight: 700 }}>
          ⚡{xp}
        </span>
        <span style={{ color: C.dim, fontSize: 12, fontWeight: 500 }}>
          {(userName || '').split(' ')[0]}
        </span>
      </div>
    </nav>
  )
}
