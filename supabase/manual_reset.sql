-- ==========================================
-- SCRIPT DE RÉINITIALISATION MANUELLE
-- ==========================================

-- 1. Ajout de la colonne 'position' (Migration)
ALTER TABLE members ADD COLUMN IF NOT EXISTS "position" INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS "wallet_balance" INTEGER DEFAULT 0;

-- 2. Nettoyage des données existantes (ATTENTION : SUPPRIME TOUT)
TRUNCATE TABLE public.attendance CASCADE;
TRUNCATE TABLE public.pots CASCADE;
TRUNCATE TABLE public.members CASCADE;
TRUNCATE TABLE public.groups CASCADE;

-- 3. Ré-insertion des données (Seed)
DO $$
DECLARE
  new_group_id uuid;
BEGIN
  -- Création du Groupe
  INSERT INTO public.groups (name, contribution_amount, admin_fee, pot_amount, rotation_days, penalty_per_day, start_date)
  VALUES ('Grovordesh Tontine - Attigangomé', 500, 50, 200000, 4, 200, '2026-02-01')
  RETURNING id INTO new_group_id;

  -- Insertion des 100 Membres avec Positions
  INSERT INTO public.members (group_id, full_name, phone, status, join_date, pin_code, position)
  VALUES 
    (new_group_id, 'ADZA Koffi A', '+228 90516766', 'ACTIVE', '2026-02-01', '1234', 1),
    (new_group_id, 'ADZA Koffi B', '+228 90516766', 'ACTIVE', '2026-02-01', '1234', 2),
    (new_group_id, 'AHIANKONOU Afi', '+228 92261003', 'ACTIVE', '2026-02-01', '1234', 3),
    (new_group_id, 'AVOGBEDOR Kossi A', '+228 97103061', 'ACTIVE', '2026-02-01', '1234', 4),
    (new_group_id, 'AVOGBEDOR Kossi B', '+228 97103061', 'ACTIVE', '2026-02-01', '1234', 5),
    (new_group_id, 'AVOGBEDOR Kossi C', '+228 97103061', 'ACTIVE', '2026-02-01', '1234', 6),
    (new_group_id, 'BIKA Daniela A', '+228 93477414', 'ACTIVE', '2026-02-01', '1234', 7),
    (new_group_id, 'SOGLO Beauty A', '+228 99876929', 'ACTIVE', '2026-02-01', '1234', 8),
    (new_group_id, 'SOGLO Beauty B', '+228 99876929', 'ACTIVE', '2026-02-01', '1234', 9),
    (new_group_id, 'AFRICAVI Zotsi A', '+228 70112674', 'ACTIVE', '2026-02-01', '1234', 10),
    (new_group_id, 'AFRICAVI Zotsi B', '+228 70112674', 'ACTIVE', '2026-02-01', '1234', 11),
    (new_group_id, 'TOKOUPERA Koffi', '+228 92903389', 'ACTIVE', '2026-02-01', '1234', 12),
    (new_group_id, 'DZEDIKU David A', '+228 91168076', 'ACTIVE', '2026-02-01', '1234', 13),
    (new_group_id, 'DZEDIKU David B', '+228 91168076', 'ACTIVE', '2026-02-01', '1234', 14),
    (new_group_id, 'ADONKO Ghislain A', '+228 90495003', 'ACTIVE', '2026-02-01', '1234', 15),
    (new_group_id, 'ADONKO Ghislain B', '+228 90495003', 'ACTIVE', '2026-02-01', '1234', 16),
    (new_group_id, 'N''DJERBI Jeanne', '+228 92993147', 'ACTIVE', '2026-02-01', '1234', 17),
    (new_group_id, 'AHOVI Rose', '+228 70014897', 'ACTIVE', '2026-02-01', '1234', 18),
    (new_group_id, 'SEDDOH Kokou Christophe', '+228 93159594', 'ACTIVE', '2026-02-01', '1234', 19),
    (new_group_id, 'KOUESSAN Rose A', '+228 92005024', 'ACTIVE', '2026-02-01', '1234', 20),
    (new_group_id, 'KOUESSAN Rosee B', '+228 92005024', 'ACTIVE', '2026-02-01', '1234', 21),
    (new_group_id, 'VOMEWOR Diouf', '+228 97613691', 'ACTIVE', '2026-02-01', '1234', 22),
    (new_group_id, 'TOSSA Kossi Josué A', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 23),
    (new_group_id, 'TOSSA Kossi Josué B', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 24),
    (new_group_id, 'TOSSA Kossi Josué C', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 25),
    (new_group_id, 'TOSSA Kossi Josué D', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 26),
    (new_group_id, 'TOSSA Kossi Josué E', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 27),
    (new_group_id, 'TOSSA Kossi Josué F', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 28),
    (new_group_id, 'TOSSA Kossi Josué G', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 29),
    (new_group_id, 'TOSSA Kossi Josué H', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 30),
    (new_group_id, 'TOSSA Kossi Josué I', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 31),
    (new_group_id, 'TOSSA Kossi Josué J', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 32),
    (new_group_id, 'NOUMONVI Komi', '+228 99303680', 'ACTIVE', '2026-02-01', '1234', 33),
    (new_group_id, 'DJOBO Shakira A', '+228 90480782', 'ACTIVE', '2026-02-01', '1234', 34),
    (new_group_id, 'DJOBO Shakira B', '+228 90480782', 'ACTIVE', '2026-02-01', '1234', 35),
    (new_group_id, 'NAWOU Aristide A', '+228 93257581', 'ACTIVE', '2026-02-01', '1234', 36),
    (new_group_id, 'NAWOU Aristide B', '+228 93257581', 'ACTIVE', '2026-02-01', '1234', 37),
    (new_group_id, 'ADJAHO Kodjo A', '+228 91217517', 'ACTIVE', '2026-02-01', '1234', 38),
    (new_group_id, 'ADJAHO Kodjo B', '+228 91217517', 'ACTIVE', '2026-02-01', '1234', 39),
    (new_group_id, 'APALOO Emmanuel A', '+228 99561047', 'ACTIVE', '2026-02-01', '1234', 40),
    (new_group_id, 'APALOO Emmanuel B', '+228 99561047', 'ACTIVE', '2026-02-01', '1234', 41),
    (new_group_id, 'TOULASSI Kokouda A', '+228 96260666', 'ACTIVE', '2026-02-01', '1234', 42),
    (new_group_id, 'TOULASSI Kokouda B', '+228 96260666', 'ACTIVE', '2026-02-01', '1234', 43),
    (new_group_id, 'EKLO Eli A', '+228 91864690', 'ACTIVE', '2026-02-01', '1234', 44),
    (new_group_id, 'EKLO Eli B', '+228 91864690', 'ACTIVE', '2026-02-01', '1234', 45),
    (new_group_id, 'EKLO Eli C', '+228 91864690', 'ACTIVE', '2026-02-01', '1234', 46),
    (new_group_id, 'EKLO Eli D', '+228 91864690', 'ACTIVE', '2026-02-01', '1234', 47),
    (new_group_id, 'ETSE Kossi Mawufiadufe A', '+228 96360572', 'ACTIVE', '2026-02-01', '1234', 48),
    (new_group_id, 'ETSE Kossi Mawufiadufe B', '+228 96360572', 'ACTIVE', '2026-02-01', '1234', 49),
    (new_group_id, 'ETSE Kossi Mawufiadufe C', '+228 96360572', 'ACTIVE', '2026-02-01', '1234', 50),
    (new_group_id, 'HOUMAVO Charlotte A', '+228 93038594', 'ACTIVE', '2026-02-01', '1234', 51),
    (new_group_id, 'ROSE Nagan', '+228 98675410', 'ACTIVE', '2026-02-01', '1234', 52),
    (new_group_id, 'DOSSEY Tony', '+228 92547060', 'ACTIVE', '2026-02-01', '1234', 53),
    (new_group_id, 'FOLLY-Bey Gerant A', '+228 90211373', 'ACTIVE', '2026-02-01', '1234', 54),
    (new_group_id, 'FOLLY-Bey Gerant B', '+228 90211373', 'ACTIVE', '2026-02-01', '1234', 55),
    (new_group_id, 'FOLLY-Bey Gerant C', '+228 90211373', 'ACTIVE', '2026-02-01', '1234', 56),
    (new_group_id, 'FOLLY-Bey Gerant D', '+228 90211373', 'ACTIVE', '2026-02-01', '1234', 57),
    (new_group_id, 'FOLLY-Bey Gerant E', '+228 90211373', 'ACTIVE', '2026-02-01', '1234', 58),
    (new_group_id, 'FOLLY-Bey Gerant F', '+228 90211373', 'ACTIVE', '2026-02-01', '1234', 59),
    (new_group_id, 'AGBOTSE Sifa A', '+228 91749455', 'ACTIVE', '2026-02-01', '1234', 60),
    (new_group_id, 'AGBOTSE Sifa B', '+228 91749455', 'ACTIVE', '2026-02-01', '1234', 61),
    (new_group_id, 'SODEGLA Jule', '+228 79666975', 'ACTIVE', '2026-02-01', '1234', 62),
    (new_group_id, 'KONOU Kokou Yovo A', '+228 92377604', 'ACTIVE', '2026-02-01', '1234', 63),
    (new_group_id, 'KONOU Kokou Yovo B', '+228 92377604', 'ACTIVE', '2026-02-01', '1234', 64),
    (new_group_id, 'MANE Komla Gilbert A', '+228 91144088', 'ACTIVE', '2026-02-01', '1234', 65),
    (new_group_id, 'MANE Komla Gilbert B', '+228 91144088', 'ACTIVE', '2026-02-01', '1234', 66),
    (new_group_id, 'AZIADEKE Rene A', '+228 96846297', 'ACTIVE', '2026-02-01', '1234', 67),
    (new_group_id, 'AZIADEKE Rene B', '+228 96846297', 'ACTIVE', '2026-02-01', '1234', 68),
    (new_group_id, 'HOUMAVO Charlotte B', '+228 93038594', 'ACTIVE', '2026-02-01', '1234', 69),
    (new_group_id, 'ANKOU Maurice', '+228 70540861', 'ACTIVE', '2026-02-01', '1234', 70),
    (new_group_id, 'BIKA Daniela B', '+228 93477414', 'ACTIVE', '2026-02-01', '1234', 71),
    (new_group_id, 'AGUDJE Bnedictus', '+228 79507037', 'ACTIVE', '2026-02-01', '1234', 72),
    (new_group_id, 'ADONKO Ghislain C', '+228 90495003', 'ACTIVE', '2026-02-01', '1234', 73),
    (new_group_id, 'ADONKO Ghislain D', '+228 90495003', 'ACTIVE', '2026-02-01', '1234', 74),
    (new_group_id, 'Groupe YCCA Sinoro', '+228 90211373', 'ACTIVE', '2026-02-01', '1234', 75),
    (new_group_id, 'AMEVIGBE Kofi Ebene-Ezer', '+228 96726056', 'ACTIVE', '2026-02-01', '1234', 76),
    (new_group_id, 'KOFFI Cafe', '+228 90516766', 'ACTIVE', '2026-02-01', '1234', 77),
    (new_group_id, 'FRANCISCO K. Pablo', '+228 97059125', 'ACTIVE', '2026-02-01', '1234', 78),
    (new_group_id, 'NOVON Gilbert', '+228 97357783', 'ACTIVE', '2026-02-01', '1234', 79),
    (new_group_id, 'NAKA Ameyo', '+228 98779767', 'ACTIVE', '2026-02-01', '1234', 80),
    (new_group_id, 'THIBAUT Koffi N. A', '+228 97103061', 'ACTIVE', '2026-02-01', '1234', 81),
    (new_group_id, 'THIBAUT Koffi N. B', '+228 97103061', 'ACTIVE', '2026-02-01', '1234', 82),
    (new_group_id, 'AHOLOU Kodjo', '+228 622554549', 'ACTIVE', '2026-02-01', '1234', 83),
    (new_group_id, 'JUSTIN Senyo', '+228 666367420', 'ACTIVE', '2026-02-01', '1234', 84),
    (new_group_id, 'TOGBENU Abra Estelle', '+228 635877509', 'ACTIVE', '2026-02-01', '1234', 85),
    (new_group_id, 'KUPA Samuel', '+228 91516344', 'ACTIVE', '2026-02-01', '1234', 86),
    (new_group_id, 'AGUDA Kekeli A', '+228 90516766', 'ACTIVE', '2026-02-01', '1234', 87),
    (new_group_id, 'AGUDA Kekeli B', '+228 90516766', 'ACTIVE', '2026-02-01', '1234', 88),
    (new_group_id, 'Mane Komla + Africavi', '+228 70112674', 'ACTIVE', '2026-02-01', '1234', 89),
    (new_group_id, 'AGBOTSE Sifa C', '+228 91749455', 'ACTIVE', '2026-02-01', '1234', 90),
    (new_group_id, 'TOSSA Kossi Josué A', '+228 98442963', 'ACTIVE', '2026-02-01', '1234', 91),
    (new_group_id, 'KODJOVI Jean', '+228 90000001', 'ACTIVE', '2026-02-01', '1234', 92),
    (new_group_id, 'AMIVI Peace', '+228 90000002', 'ACTIVE', '2026-02-01', '1234', 93),
    (new_group_id, 'KOFFI Paul', '+228 90000003', 'ACTIVE', '2026-02-01', '1234', 94),
    (new_group_id, 'AKUVI Merveille', '+228 90000004', 'ACTIVE', '2026-02-01', '1234', 95),
    (new_group_id, 'KOKOUvi Jacques', '+228 90000005', 'ACTIVE', '2026-02-01', '1234', 96),
    (new_group_id, 'ADJOAVI Josephine', '+228 90000006', 'ACTIVE', '2026-02-01', '1234', 97),
    (new_group_id, 'EKLOU Pierre', '+228 90000007', 'ACTIVE', '2026-02-01', '1234', 98),
    (new_group_id, 'MENSAH Philippe', '+228 90000008', 'ACTIVE', '2026-02-01', '1234', 99),
    (new_group_id, 'LAWSON Laté', '+228 90000009', 'ACTIVE', '2026-02-01', '1234', 100);

  RAISE NOTICE 'Groupe "Grovordesh Tontine - Attigangomé" créé (ID: %) et 100 membres importés avec succès.', new_group_id;
END $$;
