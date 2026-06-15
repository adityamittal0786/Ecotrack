import { useState } from 'react'
import { C, K } from '../design.js'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../lib/supabase.js'

const FONT = "'Space Grotesk', system-ui, sans-serif"

export default function AuthPage() {
  const [mode,     setMode]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [name,     setName]     = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error: err } = mode === 'login'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, name)
      if (err) setError(err.message)
      else if (mode === 'signup') setError('Check your email for a confirmation link!')
    } catch { setError('Something went wrong. Please try again.') }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError(null); setLoading(true)
    const { error: err } = await signInWithGoogle()
    if (err) { setError(err.message); setLoading(false) }
  }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem', fontFamily: FONT, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 25% 55%, rgba(194,245,66,0.05), transparent 55%)' }} />

      <div style={{ maxWidth: 420, width: '100%', position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s ease' }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 40, marginBottom: '0.75rem',
            filter: 'drop-shadow(0 0 18px rgba(194,245,66,0.35))' }}>🌍</div>
          <h1 style={{ fontFamily: FONT, fontSize: '1.75rem', fontWeight: 800, color: C.txt,
            letterSpacing: '-0.7px', marginBottom: '0.3rem' }}>
            ECOTRACK
          </h1>
          <p style={{ color: C.mut, fontSize: 14 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Card */}
        <div style={{ ...K.card }}>
          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{ ...K.btn(false),
            width: '100%', padding: '12px', marginBottom: '1.1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <svg width="17" height="17" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.08 0-3.84-1.4-4.47-3.29H1.83v2.07A8 8 0 0 0 8.98 17Z"/>
              <path fill="#FBBC05" d="M4.51 10.52A4.8 4.8 0 0 1 4.26 9c0-.53.09-1.04.25-1.52V5.41H1.83a8 8 0 0 0 0 7.18l2.68-2.07Z"/>
              <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.48c.63-1.89 2.4-3.9 4.48-3.9Z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.1rem' }}>
            <div style={{ flex:1, height:1, background:C.bdr }} />
            <span style={{ color:C.dim, fontSize:12 }}>or</span>
            <div style={{ flex:1, height:1, background:C.bdr }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {mode === 'signup' && (
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Full name" required style={{ ...K.input }} />
            )}
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" required style={{ ...K.input }} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required minLength={6} style={{ ...K.input }} />

            {error && (
              <div style={{
                background: error.includes('Check') ? `${C.acc}10` : 'rgba(239,68,68,0.08)',
                border: `1px solid ${error.includes('Check') ? C.acc + '40' : 'rgba(239,68,68,0.28)'}`,
                borderRadius: 8, padding: '8px 12px',
                color: error.includes('Check') ? C.acc : C.red, fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ ...K.btn(true), padding:'12px', width:'100%',
              fontSize:15, marginTop:4, opacity: loading ? 0.6 : 1 }}>
              {loading ? '···' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:'1.1rem' }}>
            <button onClick={() => { setMode(m => m==='login'?'signup':'login'); setError(null) }}
              style={{ background:'none', border:'none', color:C.mut, fontSize:13,
                cursor:'pointer', fontFamily:FONT }}>
              {mode === 'login'
                ? "No account? Sign up free"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
