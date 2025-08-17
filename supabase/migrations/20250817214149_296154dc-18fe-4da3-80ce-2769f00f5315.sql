-- Create toolkits table for saving job toolkits
CREATE TABLE public.toolkits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  title TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company TEXT NOT NULL,
  settings JSONB NOT NULL,
  inputs JSONB NOT NULL,
  outputs JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  favorite BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.toolkits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own toolkits" 
ON public.toolkits 
FOR SELECT 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create their own toolkits" 
ON public.toolkits 
FOR INSERT 
WITH CHECK (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their own toolkits" 
ON public.toolkits 
FOR UPDATE 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete their own toolkits" 
ON public.toolkits 
FOR DELETE 
USING (profile_id IN (
  SELECT id FROM profiles WHERE user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_toolkits_updated_at
BEFORE UPDATE ON public.toolkits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();