-- Add psychological_profile column to caregiver_profiles table
-- This stores scenario-based psychological profiling data for advanced matching

ALTER TABLE public.caregiver_profiles 
ADD COLUMN IF NOT EXISTS psychological_profile jsonb;

COMMENT ON COLUMN public.caregiver_profiles.psychological_profile IS 
'Stores psychological profiling data including communication style, initiative level, emotional approach, work rhythm, scenario responses, environment preferences, and motivation. Used for human-centered matching algorithm.';
