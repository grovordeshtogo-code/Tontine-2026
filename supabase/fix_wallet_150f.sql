-- Script de Correction des Portefeuilles - Option B
-- Date: 2026-02-08
-- Objectif: Soustraire 150F de tous les portefeuilles ayant au moins 150F

-- AVANT: Vérifier les soldes actuels
SELECT 
    COUNT(*) as total_membres_avec_wallet,
    SUM(wallet_balance) as somme_totale,
    AVG(wallet_balance) as moyenne,
    MAX(wallet_balance) as maximum
FROM members 
WHERE wallet_balance > 0;

-- CORRECTION: Soustraire 150F de tous les portefeuilles >= 150F
UPDATE members 
SET wallet_balance = wallet_balance - 150 
WHERE wallet_balance >= 150;

-- APRÈS: Vérifier les soldes après correction
SELECT 
    COUNT(*) as total_membres_avec_wallet,
    SUM(wallet_balance) as somme_totale,
    AVG(wallet_balance) as moyenne,
    MAX(wallet_balance) as maximum
FROM members 
WHERE wallet_balance > 0;

-- Détail des membres encore avec un solde
SELECT id, full_name, wallet_balance 
FROM members 
WHERE wallet_balance > 0
ORDER BY wallet_balance DESC;
