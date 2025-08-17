-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN subscribed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN subscription_tier TEXT,
ADD COLUMN subscription_end TIMESTAMPTZ;

-- Create index for faster subscription lookups
CREATE INDEX idx_profiles_subscription ON public.profiles(subscribed, subscription_tier);

-- Create trigger to update updated_at when subscription changes
CREATE TRIGGER update_profiles_subscription_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();