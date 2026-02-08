-- Vérification de la configuration du groupe
-- Pour identifier pourquoi 1j retard = 650F au lieu de 750F

-- 1. Vérifier la configuration du groupe "Grovordesh Tontine - Attigangomé"
SELECT 
    id,
    name,
    contribution_amount as "Cotisation",
    admin_fee as "Frais Admin",
    penalty_per_day as "Pénalité/jour",
    start_date as "Date début"
FROM groups
WHERE name LIKE '%Attigangomé%' OR name LIKE '%Grovordesh%';

-- 2. Vérifier les membres avec retard
SELECT 
    m.id,
    m.full_name,
    m.group_id,
    m.wallet_balance
FROM members m
WHERE m.full_name LIKE '%ADZA Koffi B%' 
   OR m.full_name LIKE '%AHIANKONOU%'
   OR m.full_name LIKE '%AVOGBEDOR%';

-- 3. Vérifier les paiements existants pour ces membres
SELECT 
    a.member_id,
    a.date,
    a.status,
    a.amount_paid as "Cotisation payée",
    a.fee_paid as "Frais payés",
    a.penalty_paid as "Pénalité payée"
FROM attendance a
WHERE a.member_id IN (
    SELECT id FROM members 
    WHERE full_name LIKE '%ADZA Koffi B%' 
       OR full_name LIKE '%AHIANKONOU%'
       OR full_name LIKE '%AVOGBEDOR%'
)
ORDER BY a.date DESC
LIMIT 10;

-- 4. Calcul attendu
-- Si groupe commence le 7 février et aujourd'hui 8 février à 00:45:
-- - Jours écoulés: 2 (7 et 8)
-- - Avant 20h donc: 1 jour pénalisable (seulement le 7)
-- - Dette attendue: 500 (cotisation J7) + 50 (frais J7) + 200 (pénalité J7) = 750F
-- 
-- Si on voit 650F:
-- - 650F = 500 + 150
-- - Soit: admin_fee = 100F + penalty = 50F
-- - Soit: admin_fee = 50F + penalty = 100F
-- - Soit: admin_fee = 150F + penalty = 0F
