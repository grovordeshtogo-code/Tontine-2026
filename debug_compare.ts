import { calculateMemberStatus } from './src/logic/calculations.ts';
import type { Group, Member, Attendance } from './src/types/index.ts';

// Configuration identique
const group: Group = {
    id: 'g1',
    name: 'Test Group',
    contribution_amount: 500,
    admin_fee: 50,
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

console.log("=== COMPARAISON MEMBERS vs CHECKIN ===\n");

// Test 1: Sans date de référence (défaut = new Date())
console.log("--- Test 1: Sans date de référence (comportement par défaut) ---");
const statusDefault = calculateMemberStatus(member, group, attendances);
console.log("Balance:", Math.abs(statusDefault.balance), "F");
console.log("Jours de retard:", statusDefault.daysLate);
console.log("Unpaid Contributions:", statusDefault.unpaidContributions, "F");
console.log("Unpaid Penalties:", statusDefault.unpaidPenalties, "F");

// Test 2: Avec date explicite (comme DailyCheckin pourrait faire)
console.log("\n--- Test 2: Avec date explicite (maintenant) ---");
const now = new Date();
console.log("Heure actuelle:", now.toISOString());
const statusNow = calculateMemberStatus(member, group, attendances, now);
console.log("Balance:", Math.abs(statusNow.balance), "F");
console.log("Jours de retard:", statusNow.daysLate);
console.log("Unpaid Contributions:", statusNow.unpaidContributions, "F");
console.log("Unpaid Penalties:", statusNow.unpaidPenalties, "F");

// Test 3: Vérifier si Members.tsx passe une date différente
console.log("\n--- Analyse ---");
console.log("Si Members affiche 650F et Checkin affiche 750F:");
console.log("  → Différence de 100F = probablement les pénalités");
console.log("  → Members pourrait appeler calculateMemberStatus sans date");
console.log("  → Ou Members affiche unpaidContributions au lieu de balance");
console.log("\nVérification:");
console.log("  unpaidContributions =", statusDefault.unpaidContributions, "F");
console.log("  unpaidPenalties =", statusDefault.unpaidPenalties, "F");
console.log("  balance (total) =", Math.abs(statusDefault.balance), "F");
