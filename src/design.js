// ─── Color palette ────────────────────────────────────────────
export const C = {
  bg:   '#09090b',
  surf: '#111115',
  card: '#18181d',
  bdr:  'rgba(194,245,66,0.12)',
  acc:  '#c2f542',
  dim2: 'rgba(194,245,66,0.08)',
  gold: '#f59e0b',
  txt:  '#f1f5f0',
  mut:  'rgba(241,245,240,0.68)',
  dim:  'rgba(241,245,240,0.45)',
  red:  '#ef4444',
  org:  '#f97316',
  blu:  '#38bdf8',
  pnk:  '#f472b6',
}

// Ring colors for the score visualization
export const RC = ['#c2f542', '#f59e0b', '#38bdf8', '#f472b6']

// ─── Shared style helpers ─────────────────────────────────────
export const K = {
  card: {
    background:   C.card,
    border:       `1px solid ${C.bdr}`,
    borderRadius: 14,
    padding:      '1.25rem',
  },
  btn: (primary) => ({
    padding:      '10px 20px',
    borderRadius: 9,
    fontFamily:   "'Space Grotesk', system-ui, sans-serif",
    cursor:       'pointer',
    fontWeight:   700,
    fontSize:     14,
    letterSpacing: '-0.1px',
    transition:   'all 0.15s ease',
    border:       primary ? 'none' : `1px solid ${C.bdr}`,
    background:   primary ? C.acc : 'transparent',
    color:        primary ? C.bg  : C.txt,
  }),
  input: {
    background:   C.surf,
    border:       `1px solid ${C.bdr}`,
    borderRadius: 9,
    color:        C.txt,
    fontSize:     14,
    fontFamily:   "'Space Grotesk', system-ui, sans-serif",
    outline:      'none',
    padding:      '11px 14px',
    transition:   'border-color 0.2s',
    width:        '100%',
    boxSizing:    'border-box',
  },
  tip: {
    contentStyle: {
      background:   '#1c1c22',
      border:       '1px solid rgba(194,245,66,0.15)',
      borderRadius: 8,
      color:        '#f1f5f0',
      fontSize:     12,
      padding:      '7px 11px',
      fontFamily:   "'Space Grotesk', sans-serif",
    },
    cursor: { stroke: '#c2f542', strokeWidth: 1, strokeDasharray: '3 3' },
  },
}

// ─── Global CSS injected once ─────────────────────────────────
export const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #09090b; -webkit-font-smoothing: antialiased; }
  input[type=range] { accent-color: #c2f542; cursor: pointer; width: 100%; }
  input:focus  { border-color: rgba(194,245,66,0.45) !important; }
  button:hover  { opacity: 0.86; }
  button:active { transform: scale(0.97); }
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(194,245,66,0.25); border-radius: 2px; }
  .eco-nav::-webkit-scrollbar { display: none; }

  /* Visible keyboard-focus ring on every interactive element */
  a:focus-visible,
  button:focus-visible,
  input:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid #c2f542;
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Screen-reader-only utility — visually hidden but announced by AT */
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
  @keyframes pageIn   { from { opacity:0; transform:translateY(8px)  } to { opacity:1; transform:translateY(0) } }
  @keyframes floatP   { 0%,100% { transform:translateY(0)  scale(1);   opacity:0.28 }
                        50%     { transform:translateY(-18px) scale(1.15); opacity:0.55 } }
  @keyframes blink    { 0%,100% { opacity:1 } 50% { opacity:0.15 } }
  @keyframes toastIn  { from { opacity:0; transform:translateX(28px) } to { opacity:1; transform:translateX(0) } }
  @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:0.45 } }
  @keyframes spin     { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }
  @keyframes arcIn    { from { stroke-dasharray: 0 1000 } }
`
