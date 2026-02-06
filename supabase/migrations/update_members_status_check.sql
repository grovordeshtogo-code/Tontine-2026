-- Migration: Update members status check to include ARCHIVED
-- Description: Drop existing constraint and re-add with ARCHIVED status

-- 1. Drop existing constraint (name may vary, ensuring we target the right one)
ALTER TABLE public.members
DROP CONSTRAINT IF EXISTS members_status_check;

-- 2. Add updated constraint
ALTER TABLE public.members
ADD CONSTRAINT members_status_check
CHECK (status IN ('ACTIVE', 'ALERT_8J', 'EXCLUDED', 'COMPLETED', 'ARCHIVED'));
