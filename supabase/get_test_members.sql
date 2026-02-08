-- Récupérer les membres avec leurs identifiants pour les tests
SELECT 
    m.id,
    m.full_name,
    m.pin_code,
    m.group_id,
    g.name as group_name,
    m.status,
    COUNT(DISTINCT a.id) as attendance_count,
    COUNT(DISTINCT p.id) as payout_count
FROM members m
LEFT JOIN groups g ON m.group_id = g.id
LEFT JOIN attendance a ON a.member_id = m.id
LEFT JOIN pots p ON p.member_id = m.id
WHERE m.status = 'ACTIVE'
GROUP BY m.id, m.full_name, m.pin_code, m.group_id, g.name, m.status
ORDER BY m.full_name
LIMIT 10;
