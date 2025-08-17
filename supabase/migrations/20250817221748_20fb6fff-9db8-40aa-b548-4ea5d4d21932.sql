BEGIN;

-- Add billing columns to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS plan text CHECK (plan IN ('free','pro')) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS sub_status text,                   -- 'active','trialing','past_due','canceled', etc.
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- Update existing profiles to have default plan
UPDATE public.profiles 
SET plan = 'free' 
WHERE plan IS NULL;

-- Helpful index for gating queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);

COMMIT;