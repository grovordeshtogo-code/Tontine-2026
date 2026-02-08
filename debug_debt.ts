import { calculateMemberStatus } from './src/logic/calculations.ts';
import type { Group, Member, Attendance } from './src/types/index.ts';

// Configuration du groupe (valeurs typiques)
const group: Group = {
    id: 'g1',
    name: 'Test Group',
    contribution_amount: 500,  // Cotisation
    admin_fee: 50,             // Frais admin
    penalty_per_day: 200,      // Pénalité par jour
    start_date: '2026-02-07',  // Commencé hier
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

// Scénario: Membre n'a rien payé, 1 jour de retard
const attendances: Attendance[] = [];

// Test à différentes heures
console.log("=== SCÉNARIO: 1 JOUR DE RETARD (rien payé) ===\n");

// Test 1: Avant 20h (par exemple 15h)
const date15h = new Date('2026-02-08T15:00:00');
const status15h = calculateMemberStatus(member, group, attendances, date15h);

console.log("--- Test à 15h (avant 20h) ---");
console.log("Jours de retard:", status15h.daysLate);
console.log("Cotisation due:", status15h.totalContributionDue, "F");
console.log("Pénalité due:", status15h.totalPenaltyDue, "F");
console.log("Unpaid Contributions (inclut frais):", status15h.unpaidContributions, "F");
console.log("Unpaid Penalties:", status15h.unpaidPenalties, "F");
console.log("Balance (dette):", Math.abs(status15h.balance), "F");
console.log("\nDétail attendu:");
console.log("  - 2 jours × 500F (cotisation) = 1000F");
console.log("  - 2 jours × 50F (frais) = 100F");
console.log("  - Pénalité: ? (dépend de la règle 20h)");
console.log("  - Total attendu si 1j pénalisé: 1000 + 100 + 200 = 1300F");
console.log("  - Total attendu si 0j pénalisé: 1000 + 100 = 1100F");

// Test 2: Après 20h (par exemple 22h)
const date22h = new Date('2026-02-08T22:00:00');
const status22h = calculateMemberStatus(member, group, attendances, date22h);

console.log("\n--- Test à 22h (après 20h) ---");
console.log("Jours de retard:", status22h.daysLate);
console.log("Cotisation due:", status22h.totalContributionDue, "F");
console.log("Pénalité due:", status22h.totalPenaltyDue, "F");
console.log("Unpaid Contributions (inclut frais):", status22h.unpaidContributions, "F");
console.log("Unpaid Penalties:", status22h.unpaidPenalties, "F");
console.log("Balance (dette):", Math.abs(status22h.balance), "F");
console.log("\nDétail attendu:");
console.log("  - 2 jours × 500F (cotisation) = 1000F");
console.log("  - 2 jours × 50F (frais) = 100F");
console.log("  - 2 jours × 200F (pénalité) = 400F");
console.log("  - Total attendu: 1000 + 100 + 400 = 1500F");

// Analyse de l'écart
console.log("\n=== ANALYSE ===");
console.log("Si l'utilisateur voit 650F pour '1 jour de retard':");
console.log("  - Attendu: 500 + 50 + 200 = 750F");
console.log("  - Observé: 650F");
console.log("  - Écart: -100F");
console.log("\nHypothèses:");
console.log("  1. Les frais (50F) ne sont pas comptés dans unpaidContributions");
console.log("  2. La pénalité n'est pas appliquée (règle 20h)");
console.log("  3. Le calcul de 'daysLate' est incorrect");
