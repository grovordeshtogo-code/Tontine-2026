-- Migration: Fix pots foreign key to allow member deletion
-- Description: Drop existing constraint and re-add with ON DELETE CASCADE

-- 1. Drop the existing foreign key constraint
-- Note: We wrap in a DO block or simple statement. 
-- Assuming standard naming convention 'pots_member_id_fkey'. 
-- If the name is different, you might need to find it first.
ALTER TABLE public.pots
DROP CONSTRAINT IF EXISTS pots_member_id_fkey;

-- 2. Add the new foreign key with CASCADE DELETE
ALTER TABLE public.pots
ADD CONSTRAINT pots_member_id_fkey
FOREIGN KEY (member_id)
REFERENCES public.members(id)
ON DELETE CASCADE;
