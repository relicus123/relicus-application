-- =============================================================================
-- RELICUS SECURITY FINDING #7: SERVER-ENFORCED DEVICE LIMIT
-- =============================================================================
-- Vulnerability: p_max_devices was a client-controlled parameter that was
--   used directly in security-critical eviction logic. A malicious client
--   could call this RPC with p_max_devices=999 to bypass the 2-device limit,
--   or p_max_devices=0 to wipe all existing device sessions.
--
-- Fix: Introduce v_enforced_max CONSTANT INT := 2 inside the function body.
--   Replace ALL security-critical uses of p_max_devices with v_enforced_max.
--   The p_max_devices parameter is KEPT in the signature for backward
--   compatibility with older installed app versions (prevents PGRST202).
--   The client-provided value is accepted but completely ignored.
--
-- Scope: CREATE OR REPLACE FUNCTION only.
--   No table changes. No RLS changes. No grant changes. No data changes.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.register_device_session(
  p_device_id   TEXT,
  p_device_name TEXT DEFAULT 'Unknown Device',
  p_platform    TEXT DEFAULT 'unknown',
  p_max_devices INT  DEFAULT 2           -- kept for backward compat; value is IGNORED
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id       UUID := auth.uid();
  v_existing_id   UUID;
  v_device_count  INT;
  v_kicked_count  INT := 0;
  -- Security Finding #7: server-enforced constant; client-provided p_max_devices is ignored
  v_enforced_max  CONSTANT INT := 2;
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
      device_name    = COALESCE(p_device_name, device_name),
      platform       = COALESCE(p_platform, platform)
    WHERE id = v_existing_id;

    RETURN jsonb_build_object(
      'status',    'success',
      'action',    'updated',
      'device_id', p_device_id
    );
  END IF;

  -- Step 2: Check current active device count
  SELECT COUNT(*) INTO v_device_count
  FROM public.user_devices
  WHERE user_id = v_user_id;

  -- Step 3: If server-enforced limit reached (>= v_enforced_max), evict the oldest device(s)
  --         v_enforced_max replaces p_max_devices here — client value is NOT used
  IF v_device_count >= v_enforced_max THEN
    WITH oldest_devices AS (
      SELECT id
      FROM public.user_devices
      WHERE user_id = v_user_id
      ORDER BY last_active_at ASC
      LIMIT (v_device_count - v_enforced_max + 1)   -- server constant, not client param
    )
    DELETE FROM public.user_devices
    WHERE id IN (SELECT id FROM oldest_devices);

    GET DIAGNOSTICS v_kicked_count = ROW_COUNT;
  END IF;

  -- Step 4: Register the new device session
  INSERT INTO public.user_devices (user_id, device_id, device_name, platform, last_active_at)
  VALUES (v_user_id, p_device_id, p_device_name, p_platform, timezone('utc'::text, now()));

  RETURN jsonb_build_object(
    'status',       'success',
    'action',       'registered',
    'device_id',    p_device_id,
    'kicked_count', v_kicked_count
  );
END;
$$;

-- =============================================================================
-- No table changes. No RLS changes. No grant changes. No data modifications.
-- =============================================================================
