import { useState, useEffect, useMemo, useCallback } from 'react'
import { calcFP, getScore, makeTrend } from './lib/calculations.js'
import { C } from './design.js'

import Navbar        from './components/Navbar.jsx'
import { Toasts }    from './components/Shared.jsx'

import Onboarding      from './pages/Onboarding.jsx'
import Dashboard       from './pages/Dashboard.jsx'
import ImpactSimulator from './pages/ImpactSimulator.jsx'
import CarbonTwin      from './pages/CarbonTwin.jsx'
import Achievements    from './pages/Achievements.jsx'
import Progress        from './pages/Progress.jsx'
import Leaderboard     from './pages/Leaderboard.jsx'
import Settings        from './pages/Settings.jsx'

// ── localStorage helpers ─────────────────────────────────────
const STORAGE_KEY = 'ecotrack_v3'

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export default function App() {
  const [userData,      setUserData]      = useState(() => loadData())
  const [page,          setPage]          = useState('dashboard')
  const [xp,            setXP]            = useState(() => loadData()?.xp || 0)
  const [streak]                          = useState(() => loadData()?.streak || 1)
  const [todayLogs,     setTodayLogs]     = useState([])
  const [toasts,        setToasts]        = useState([])
  const [recalculating, setRecalculating] = useState(false)

  // ── Toast + XP ────────────────────────────────────────────────
  const toast = useCallback((msg, ok = true) => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, ok }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])

  const gainXP = useCallback((amt, msg) => {
    setXP(p => {
      const next = p + amt
      const current = loadData() || {}
      saveData({ ...current, xp: next })
      return next
    })
    toast(msg || `+${amt} XP`)
  }, [toast])

  // ── All hooks before early returns ─────────────────────────────
  const fp      = useMemo(() =>
    userData ? calcFP(userData) : { transport:0, energy:0, food:0, shopping:0, monthly:0, yearly:0 }
  , [userData])

  const trend   = useMemo(() =>
    fp.monthly ? makeTrend(fp.monthly, Math.round(fp.monthly)) : []
  , [fp.monthly])

  const derived = useMemo(() => getScore(fp.yearly), [fp.yearly])

  // ── Handlers ──────────────────────────────────────────────────
  const handleOnboardComplete = useCallback((formData) => {
    const newXP  = getScore(calcFP(formData).yearly).xp
    const full   = { ...formData, xp: newXP, streak: userData?.streak || 1 }
    setUserData(full)
    setXP(newXP)
    setRecalculating(false)
    setPage('dashboard')
    saveData(full)
  }, [userData])

  const handleLog = useCallback((type) => {
    if (todayLogs.includes(type)) return
    setTodayLogs(p => [...p, type])
    gainXP(25, `Logged ${type} · +25 XP`)
  }, [todayLogs, gainXP])

  const handleUpdate = useCallback((updates) => {
    setUserData(p => {
      const next = { ...p, ...updates }
      saveData(next)
      return next
    })
  }, [])

  const handleRecalculate = useCallback(() => {
    setRecalculating(true)
    setPage('dashboard')
  }, [])

  // ── Not onboarded or recalculating → show questionnaire ───────
  if (!userData || recalculating) return (
    <Onboarding
      onComplete={handleOnboardComplete}
      isRecalculate={recalculating}
      savedName={userData?.name || ''}
    />
  )

  // ── Main app ──────────────────────────────────────────────────
  const { score, level, color } = derived
  const shared = { fp, score, level, color, xp, trend, userData, streak }

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.txt,
      fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
      <Toasts items={toasts} />
      <Navbar page={page} setPage={setPage} userName={userData.name} xp={xp} streak={streak} />

      <div style={{ animation: 'pageIn 0.3s ease' }}>
        <main>
          {page === 'dashboard'    && <Dashboard    {...shared} todayLogs={todayLogs} onLog={handleLog} />}
          {page === 'simulator'    && <ImpactSimulator userData={userData} />}
          {page === 'twin'         && <CarbonTwin   fp={fp} />}
          {page === 'achievements' && <Achievements {...shared} />}
          {page === 'progress'     && <Progress     {...shared} />}
          {page === 'leaderboard'  && <Leaderboard  fp={fp} userData={userData} />}
          {page === 'settings'     && (
            <Settings
              {...shared}
              onUpdate={handleUpdate}
              onRecalculate={handleRecalculate}
            />
          )}
        </main>
      </div>
    </div>
  )
}
