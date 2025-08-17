-- Add is_master column to resumes table for tracking master resume
ALTER TABLE public.resumes ADD COLUMN is_master BOOLEAN DEFAULT false;

-- Create jobs table for managing job descriptions
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  company_signal TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  archived BOOLEAN DEFAULT false,
  
  CONSTRAINT fk_jobs_profile_id FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Enable RLS on jobs table
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for jobs table
CREATE POLICY "Users can view their own jobs" 
ON public.jobs 
FOR SELECT 
USING (profile_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can create their own jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (profile_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (profile_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can delete their own jobs" 
ON public.jobs 
FOR DELETE 
USING (profile_id IN ( SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Create trigger for automatic timestamp updates on jobs
CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to ensure only one master resume per user
CREATE UNIQUE INDEX idx_one_master_per_profile ON public.resumes (profile_id) 
WHERE is_master = true;