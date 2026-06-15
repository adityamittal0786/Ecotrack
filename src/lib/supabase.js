import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co'
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
})

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const signInWithEmail  = (e, p)    => supabase.auth.signInWithPassword({ email: e, password: p })
export const signUpWithEmail  = (e, p, n) => supabase.auth.signUp({ email: e, password: p, options: { data: { name: n } } })
export const signInWithGoogle = ()         => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}` } })
export const signOut          = ()         => supabase.auth.signOut()

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getProfile(userId) {
  return supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function upsertProfile(userId, data) {
  return supabase
    .from('profiles')
    .upsert({ id: userId, ...data, updated_at: new Date().toISOString() })
    .select()
    .single()
}

// ─── Activity logs ────────────────────────────────────────────────────────────
export async function logActivity(userId, type, xp = 25) {
  return supabase.from('activity_logs').insert({ user_id: userId, activity_type: type, xp_earned: xp })
}

export async function getTodayLogs(userId) {
  const today = new Date().toISOString().split('T')[0]
  return supabase.from('activity_logs').select('activity_type').eq('user_id', userId).eq('log_date', today)
}

// ─── Snapshots ────────────────────────────────────────────────────────────────
export async function getSnapshots(userId, limit = 12) {
  const { data, error } = await supabase
    .from('emission_snapshots')
    .select('*')
    .eq('user_id', userId)
    .order('snapshot_month', { ascending: false })
    .limit(limit)
  return { data: data?.reverse(), error }
}

export async function saveSnapshot(userId, fp, score) {
  const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0)
  return supabase.from('emission_snapshots').upsert({
    user_id:        userId,
    snapshot_month: d.toISOString().split('T')[0],
    transport_kg:   Math.round(fp.transport),
    energy_kg:      Math.round(fp.energy),
    food_kg:        Math.round(fp.food),
    shopping_kg:    Math.round(fp.shopping),
    total_kg:       Math.round(fp.monthly),
    eco_score:      score,
  })
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export async function getLeaderboard(limit = 10) {
  return supabase.from('leaderboard').select('*').limit(limit)
}
