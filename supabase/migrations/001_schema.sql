-- ================================================================
-- EcoTrack — Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID  REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name          TEXT  NOT NULL DEFAULT '',
  diet          TEXT  NOT NULL DEFAULT 'vegetarian'
                      CHECK (diet IN ('vegan','vegetarian','nonveg')),

  -- Transport (weekly km)
  car_km        FLOAT NOT NULL DEFAULT 0,
  bus_km        FLOAT NOT NULL DEFAULT 0,
  train_km      FLOAT NOT NULL DEFAULT 0,
  metro_km      FLOAT NOT NULL DEFAULT 0,
  flights       FLOAT NOT NULL DEFAULT 0,   -- per year

  -- Home energy
  electricity   FLOAT NOT NULL DEFAULT 0,   -- kWh/month
  ac_hours      FLOAT NOT NULL DEFAULT 0,   -- hrs/day
  gas           FLOAT NOT NULL DEFAULT 0,   -- units/month

  -- Shopping
  clothing      FLOAT NOT NULL DEFAULT 0,   -- items/year
  electronics   FLOAT NOT NULL DEFAULT 0,   -- items/year
  online_orders FLOAT NOT NULL DEFAULT 0,   -- orders/week

  -- Gamification
  xp            INTEGER NOT NULL DEFAULT 0,
  streak        INTEGER NOT NULL DEFAULT 0,
  last_active   DATE,

  -- State
  onboarded     BOOLEAN NOT NULL DEFAULT false,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Activity logs ────────────────────────────────────────────────
CREATE TABLE public.activity_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('commute','meal','energy','other')),
  xp_earned     INTEGER NOT NULL DEFAULT 25,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One log per activity type per day
CREATE UNIQUE INDEX uq_activity_per_day
  ON public.activity_logs (user_id, log_date, activity_type);

-- ── Monthly emission snapshots ───────────────────────────────────
CREATE TABLE public.emission_snapshots (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  snapshot_month DATE NOT NULL,   -- first day of month: 2025-01-01
  transport_kg   FLOAT NOT NULL DEFAULT 0,
  energy_kg      FLOAT NOT NULL DEFAULT 0,
  food_kg        FLOAT NOT NULL DEFAULT 0,
  shopping_kg    FLOAT NOT NULL DEFAULT 0,
  total_kg       FLOAT NOT NULL DEFAULT 0,
  eco_score      INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, snapshot_month)
);

-- ── Earned badges ────────────────────────────────────────────────
CREATE TABLE public.user_achievements (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id   TEXT NOT NULL,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, badge_id)
);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements  ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Leaderboard: authenticated users can read scores of others (name + score only)
CREATE POLICY "profiles_leaderboard" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Activity logs
CREATE POLICY "logs_all"    ON public.activity_logs USING (auth.uid() = user_id);
CREATE POLICY "logs_insert" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Snapshots
CREATE POLICY "snap_all"    ON public.emission_snapshots USING (auth.uid() = user_id);
CREATE POLICY "snap_insert" ON public.emission_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Achievements
CREATE POLICY "ach_all"    ON public.user_achievements USING (auth.uid() = user_id);
CREATE POLICY "ach_insert" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Auto-create profile row on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Update streak and XP on activity log
CREATE OR REPLACE FUNCTION public.handle_activity_logged()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  last_date DATE;
BEGIN
  SELECT last_active INTO last_date FROM public.profiles WHERE id = NEW.user_id;
  IF last_date = CURRENT_DATE - 1 THEN
    UPDATE public.profiles
      SET streak = streak + 1, last_active = CURRENT_DATE, xp = xp + NEW.xp_earned
      WHERE id = NEW.user_id;
  ELSIF last_date = CURRENT_DATE THEN
    UPDATE public.profiles SET xp = xp + NEW.xp_earned WHERE id = NEW.user_id;
  ELSE
    UPDATE public.profiles
      SET streak = 1, last_active = CURRENT_DATE, xp = xp + NEW.xp_earned
      WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_activity_logged
  AFTER INSERT ON public.activity_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_activity_logged();

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX idx_logs_user_date  ON public.activity_logs      (user_id, log_date DESC);
CREATE INDEX idx_snaps_user_mo   ON public.emission_snapshots (user_id, snapshot_month DESC);
CREATE INDEX idx_ach_user        ON public.user_achievements  (user_id);

-- ================================================================
-- LEADERBOARD VIEW
-- ================================================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  id,
  name,
  LEFT(name, 2) AS avatar,
  xp,
  streak,
  GREATEST(8, LEAST(100, ROUND(100 - (
    (
      car_km * 4 * 0.21 + bus_km * 4 * 0.089 + train_km * 4 * 0.041 +
      metro_km * 4 * 0.036 + flights * 255.0 / 12 +
      electricity * 0.82 + ac_hours * 30 * 2.87 + gas * 2.04 +
      CASE diet
        WHEN 'vegan'       THEN 1.5
        WHEN 'vegetarian'  THEN 2.5
        ELSE 7.2
      END * 30 +
      clothing * 33.0 / 12 + electronics * 300.0 / 12 + online_orders * 4 * 3
    ) * 12 / 7500.0
  ) * 92))) AS eco_score
FROM public.profiles
WHERE onboarded = true
ORDER BY eco_score DESC;
