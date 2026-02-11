-- Add psychological_profile column to disabled_profiles table
-- This stores scenario-based psychological profiling data for advanced matching
-- mirroring the structure used for caregivers but tailored for the assisted person/family

ALTER TABLE public.disabled_profiles 
ADD COLUMN IF NOT EXISTS psychological_profile jsonb;

COMMENT ON COLUMN public.disabled_profiles.psychological_profile IS 
'Stores psychological preferences including communication style, desired autonomy level, emotional approach, rhythm, environment preferences, and reaction to unforeseen events.';
