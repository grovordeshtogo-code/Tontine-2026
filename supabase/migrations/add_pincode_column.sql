-- Ajout de la colonne pin_code pour l'authentification des membres
ALTER TABLE public.members ADD COLUMN pin_code text;
