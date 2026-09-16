-- =============================================================================
-- RELICUS: 2-DEVICE LOGIN LIMIT & ACTIVE SESSIONS
-- Run this script in your Supabase Dashboard -> SQL Editor
-- =============================================================================

-- 1. Create the user_devices table
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  platform TEXT NOT NULL DEFAULT 'unknown',
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_devices_user_device_unique UNIQUE (user_id, device_id)
);

-- Index for fast user queries and ordering by activity
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_last_active ON public.user_devices(user_id, last_active_at ASC);

-- 2. Row Level Security (RLS)
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own registered devices
DROP POLICY IF EXISTS "Users can view their own devices" ON public.user_devices;
CREATE POLICY "Users can view their own devices"
  ON public.user_devices FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to delete (log out) their own registered devices
DROP POLICY IF EXISTS "Users can delete their own devices" ON public.user_devices;
CREATE POLICY "Users can delete their own devices"
  ON public.user_devices FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Atomic RPC Function for Registering Device Session (Option A: Auto-Kick)
CREATE OR REPLACE FUNCTION public.register_device_session(
  p_device_id TEXT,
  p_device_name TEXT DEFAULT 'Unknown Device',
  p_platform TEXT DEFAULT 'unknown',
  p_max_devices INT DEFAULT 2
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing_id UUID;
  v_device_count INT;
  v_kicked_count INT := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  IF p_device_id IS NULL OR length(trim(p_device_id)) = 0 THEN
    RAISE EXCEPTION 'Device ID is required';
  END IF;

  -- Step 1: If current device is already registered, refresh timestamp and info
  SELECT id INTO v_existing_id
  FROM public.user_devices
  WHERE user_id = v_user_id AND device_id = p_device_id;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.user_devices
    SET 
      last_active_at = timezone('utc'::text, now()),
      device_name = COALESCE(p_device_name, device_name),
      platform = COALESCE(p_platform, platform)
    WHERE id = v_existing_id;

    RETURN jsonb_build_object(
      'status', 'success',
      'action', 'updated',
      'device_id', p_device_id
    );
  END IF;

  -- Step 2: Check current active device count
  SELECT COUNT(*) INTO v_device_count
  FROM public.user_devices
  WHERE user_id = v_user_id;

  -- Step 3: If limit reached (>= p_max_devices), evict the oldest device(s)
  IF v_device_count >= p_max_devices THEN
    WITH oldest_devices AS (
      SELECT id
      FROM public.user_devices
      WHERE user_id = v_user_id
      ORDER BY last_active_at ASC
      LIMIT (v_device_count - p_max_devices + 1)
    )
    DELETE FROM public.user_devices
    WHERE id IN (SELECT id FROM oldest_devices);

    GET DIAGNOSTICS v_kicked_count = ROW_COUNT;
  END IF;

  -- Step 4: Register the new device session
  INSERT INTO public.user_devices (user_id, device_id, device_name, platform, last_active_at)
  VALUES (v_user_id, p_device_id, p_device_name, p_platform, timezone('utc'::text, now()));

  RETURN jsonb_build_object(
    'status', 'success',
    'action', 'registered',
    'device_id', p_device_id,
    'kicked_count', v_kicked_count
  );
END;
$$;

-- 4. Enable Supabase Realtime on user_devices so kicked devices react instantly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'user_devices'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_devices;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END;
$$;
