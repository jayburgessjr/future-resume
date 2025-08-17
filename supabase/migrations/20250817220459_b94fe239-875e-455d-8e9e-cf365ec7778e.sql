-- Enhance profiles table for auth flow
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT CHECK (plan IN ('free', 'pro')) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS onboarding_status TEXT CHECK (onboarding_status IN ('new', 'pricing_viewed', 'complete')) DEFAULT 'new',
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now();

-- Update existing profiles to have default values
UPDATE public.profiles 
SET onboarding_status = 'complete' 
WHERE onboarding_status IS NULL;

-- Create function to update last_active_at
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last_active_at
DROP TRIGGER IF EXISTS update_profiles_last_active ON public.profiles;
CREATE TRIGGER update_profiles_last_active
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();