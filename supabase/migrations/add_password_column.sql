-- Ajout de la colonne mot de passe à la table groups
ALTER TABLE public.groups ADD COLUMN password text;