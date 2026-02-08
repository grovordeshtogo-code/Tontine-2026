import { calculateMemberStatus } from './src/logic/calculations.ts';
import type { Group, Member, Attendance } from './src/types/index.ts';

console.log("=== REPRODUCTION: 1 jour retard = 650F ===\n");

// Scénario 1: Groupe avec admin_fee = 50F
const group1: Group = {
    id: 'g1',
    name: 'Groupe avec frais',
    contribution_amount: 500,
    admin_fee: 50,
    penalty_per_day: 200,
    start_date: '2026-02-07',
    rotation_days: 7,
    currency: 'F',
    pot_amount: 0,
    members_count: 0
};

// Scénario 2: Groupe SANS admin_fee
const group2: Group = {
    id: 'g2',
    name: 'Groupe sans frais',
    contribution_amount: 500,
    admin_fee: 0,
    penalty_per_day: 200,
    start_date: '2026-02-07',
    rotation_days: 7,
    currency: 'F',
    pot_amount: 0,
    members_count: 0
};

const member: Member = {
    id: 'm1',
    group_id: 'g1',
    full_name: 'Test Member',
    phone: '123',
    status: 'ACTIVE',
    join_date: '2026-02-07',
    wallet_balance: 0,
    pin_code: '0000'
};

const attendances: Attendance[] = [];
const now = new Date('2026-02-08T00:30:00'); // Après 20h

console.log("Heure:", now.toISOString());
console.log("Heure locale:", now.getHours(), "h\n");

// Test 1: Avec frais admin
console.log("--- Scénario 1: Avec admin_fee = 50F ---");
const status1 = calculateMemberStatus(member, group1, attendances, now);
console.log("Jours de retard:", status1.daysLate);
console.log("Balance (dette totale):", Math.abs(status1.balance), "F");
console.log("Détail:");
console.log("  - Cotisations dues:", status1.totalContributionDue, "F");
console.log("  - Pénalités dues:", status1.totalPenaltyDue, "F");
console.log("  - Unpaid Contributions:", status1.unpaidContributions, "F");
console.log("  - Unpaid Penalties:", status1.unpaidPenalties, "F");
console.log("Calcul attendu: 500 + 50 + 200 = 750F");
console.log("Résultat:", Math.abs(status1.balance) === 750 ? "✅ CORRECT" : "❌ INCORRECT");

// Test 2: Sans frais admin
console.log("\n--- Scénario 2: Sans admin_fee (0F) ---");
const status2 = calculateMemberStatus(member, group2, attendances, now);
console.log("Jours de retard:", status2.daysLate);
console.log("Balance (dette totale):", Math.abs(status2.balance), "F");
console.log("Calcul attendu: 500 + 0 + 200 = 700F");
console.log("Résultat:", Math.abs(status2.balance) === 700 ? "✅ CORRECT" : "❌ INCORRECT");

console.log("\n=== ANALYSE ===");
console.log("Si vous voyez 650F:");
console.log("  → Ce n'est ni 750F (avec frais) ni 700F (sans frais)");
console.log("  → 650F = 500F + 150F");
console.log("  → Hypothèse: Pénalité = 150F au lieu de 200F ?");
console.log("  → Ou: Frais = 100F + Pénalité = 50F ?");
console.log("  → Vérifier la configuration réelle du groupe dans la DB");
