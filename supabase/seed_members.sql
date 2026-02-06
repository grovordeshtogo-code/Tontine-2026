-- Ce script insère automatiquement 100 membres dans le PREMIER groupe trouvé en base.
-- Plus besoin de copier-coller l'ID manuellement.

WITH target_group AS (
  SELECT id FROM public.groups LIMIT 1
),
names_source AS (
  SELECT unnest(ARRAY['Amadou', 'Mamadou', 'Fatou', 'Aminata', 'Moussa', 'Oumar', 'Seydou', 'Awa', 'Mariam', 'Ibrahim', 'Youssouf', 'Abdoulaye', 'Kadiatou', 'Fanta', 'Sékou', 'Jean', 'Paul', 'Marie', 'Luc', 'Sophie']) as first_name,
         unnest(ARRAY['Diallo', 'Sow', 'Barry', 'Bah', 'Camara', 'Traoré', 'Cissé', 'Keïta', 'Diop', 'Ndiaye', 'Fall', 'Wade', 'Mbodj', 'Sy', 'Gueye', 'Koné', 'Touré', 'Coulibaly', 'Diarra', 'Sako']) as last_name
)
INSERT INTO public.members (group_id, full_name, phone, status, join_date)
SELECT
  (SELECT id FROM target_group), -- L'ID est récupéré ici automatiquement
  (
    (SELECT first_name FROM names_source ORDER BY random() LIMIT 1) || ' ' ||
    (SELECT last_name FROM names_source ORDER BY random() LIMIT 1)
  ) as full_name,
  ('6' || floor(random() * 90000000 + 10000000)::text) as phone,
  'ACTIVE',
  current_date
FROM generate_series(1, 100); -- Génère 100 lignes
