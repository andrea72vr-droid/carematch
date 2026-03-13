-- Deleting fictitious profiles and resetting tables
-- This script truncates the main profile tables to remove all test data.
-- Cascade ensures dependent matches and feedback are also deleted.

TRUNCATE TABLE public.caregiver_profiles CASCADE;
TRUNCATE TABLE public.disabled_profiles CASCADE;
TRUNCATE TABLE public.matches CASCADE;
TRUNCATE TABLE public.match_feedbacks CASCADE;

-- Optionally, if we wanted to remove the users from auth we would need admin access, 
-- but from here we can only clean public tables.
