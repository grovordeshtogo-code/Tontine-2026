-- Ajout 'ARCHIVED' au check constraint de status
ALTER TABLE public.members DROP CONSTRAINT members_status_check;
ALTER TABLE public.members ADD CONSTRAINT members_status_check 
  CHECK (status IN ('ACTIVE', 'ALERT_8J', 'EXCLUDED', 'COMPLETED', 'ARCHIVED'));
