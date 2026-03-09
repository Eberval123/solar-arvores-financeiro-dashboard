-- Fix the search_path issue for the update_updated_at_column function
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';