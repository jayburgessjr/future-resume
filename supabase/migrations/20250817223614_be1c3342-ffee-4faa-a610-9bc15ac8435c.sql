BEGIN;

-- Fix security warnings by setting search_path on all functions
CREATE OR REPLACE FUNCTION public._assert_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Not authorized (admin only)';
  END IF;
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_me_is_admin()
RETURNS boolean
SECURITY DEFINER
LANGUAGE sql
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.is_admin = TRUE
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_analytics_summary(days int DEFAULT 30)
RETURNS json
SECURITY DEFINER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  _check boolean;
  _since timestamptz := (now() - make_interval(days := days));
  _total_users int;
  _pro_users int;
  _free_users int;
  _toolkits_7d int;
  _toolkits_30d int;
  _active_7d int;
  _new_users_by_day json;
  _toolkits_by_day json;
BEGIN
  -- admin gate
  SELECT public._assert_admin() INTO _check;

  SELECT COUNT(*) INTO _total_users FROM public.profiles;
  SELECT COUNT(*) INTO _pro_users  FROM public.profiles WHERE plan = 'pro';
  SELECT COUNT(*) INTO _free_users  FROM public.profiles WHERE plan = 'free';

  SELECT COUNT(*) INTO _toolkits_7d  FROM public.toolkits WHERE created_at >= now() - interval '7 days';
  SELECT COUNT(*) INTO _toolkits_30d FROM public.toolkits WHERE created_at >= now() - interval '30 days';

  SELECT COUNT(DISTINCT user_id) INTO _active_7d
  FROM public.profiles p
  WHERE p.last_active_at >= now() - interval '7 days';

  -- timeseries: new users/day
  SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) INTO _new_users_by_day
  FROM (
    SELECT date_trunc('day', created_at) AS day, COUNT(*) AS count
    FROM public.profiles
    WHERE created_at >= _since
    GROUP BY 1 ORDER BY 1
  ) t;

  -- timeseries: toolkits/day
  SELECT coalesce(json_agg(row_to_json(t)), '[]'::json) INTO _toolkits_by_day
  FROM (
    SELECT date_trunc('day', created_at) AS day, COUNT(*) AS count
    FROM public.toolkits
    WHERE created_at >= _since
    GROUP BY 1 ORDER BY 1
  ) t;

  RETURN json_build_object(
    'totals', json_build_object(
      'users', _total_users,
      'pro', _pro_users,
      'free', _free_users,
      'toolkits_7d', _toolkits_7d,
      'toolkits_30d', _toolkits_30d,
      'active_7d', _active_7d
    ),
    'series', json_build_object(
      'new_users_by_day', _new_users_by_day,
      'toolkits_by_day', _toolkits_by_day
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_users_list(
  search text DEFAULT '',
  plan_filter text DEFAULT '',
  limit_param int DEFAULT 25,
  offset_param int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  email text,
  plan text,
  sub_status text,
  created_at timestamptz,
  last_active_at timestamptz,
  toolkits_count int,
  is_admin boolean
)
SECURITY DEFINER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _check boolean;
BEGIN
  SELECT public._assert_admin() INTO _check;

  RETURN QUERY
  WITH s AS (
    SELECT trim(search) AS q, trim(plan_filter) AS plan_q
  )
  SELECT p.id, p.email, p.plan, p.sub_status, p.created_at, p.last_active_at,
         coalesce(t.cnt,0) AS toolkits_count, p.is_admin
  FROM public.profiles p
  LEFT JOIN (
    SELECT profile_id, COUNT(*) AS cnt
    FROM public.toolkits
    GROUP BY 1
  ) t ON t.profile_id = p.id
  WHERE ((SELECT q FROM s) = '' OR p.email ILIKE '%' || (SELECT q FROM s) || '%')
    AND ((SELECT plan_q FROM s) = '' OR p.plan = (SELECT plan_q FROM s))
  ORDER BY p.created_at DESC
  LIMIT limit_param OFFSET offset_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_toolkits_list(
  search text DEFAULT '',
  limit_param int DEFAULT 25,
  offset_param int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  profile_id uuid,
  user_email text,
  title text,
  company text,
  job_title text,
  created_at timestamptz
)
SECURITY DEFINER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE _check boolean;
BEGIN
  SELECT public._assert_admin() INTO _check;

  RETURN QUERY
  SELECT t.id, t.profile_id, p.email AS user_email,
         t.title, t.company, t.job_title, t.created_at
  FROM public.toolkits t
  JOIN public.profiles p ON p.id = t.profile_id
  WHERE search = '' 
        OR t.company ILIKE '%' || search || '%'
        OR t.job_title ILIKE '%' || search || '%'
        OR t.title ILIKE '%' || search || '%'
  ORDER BY t.created_at DESC
  LIMIT limit_param OFFSET offset_param;
END;
$$;

COMMIT;