import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import type { Group, Member, Attendance } from '../types';

export const BASE_CONTRIBUTION = 550;
export const PENALTY_PER_DAY = 200;

export interface MemberFinanceStatus {
    totalContributionDue: number;
    totalPenaltyDue: number;
    totalPaid: number;
    balance: number; // Negative = Debt
    daysLate: number;
    status: Member['status'];
}

/**
 * Calcule l'état financier d'un membre à une date donnée (aujourd'hui par défaut)
 */
export function calculateMemberStatus(
    member: Member,
    group: Group,
    attendances: Attendance[],
    referenceDate: Date = new Date()
): MemberFinanceStatus {
    const start = parseISO(group.start_date);
    const now = startOfDay(referenceDate);

    // Initial calculation: counts today as a full day
    let daysSinceStart = differenceInCalendarDays(now, start) + 1;

    // RULE 20H UTC: 
    // The contribution for "today" is only technically due after 20:00 UTC.
    // Before that time, we shouldn't count today as a late/due day.
    if (referenceDate.getUTCHours() < 20) {
        daysSinceStart = Math.max(0, daysSinceStart - 1);
    }

    // Si le groupe n'a pas commencé
    if (daysSinceStart <= 0) {
        return {
            totalContributionDue: 0,
            totalPenaltyDue: 0,
            totalPaid: 0,
            balance: 0,
            daysLate: 0,
            status: member.status,
        };
    }

    // Calcul du dû théorique (hors pénalités)
    const totalContributionDue = daysSinceStart * group.contribution_amount;
    const totalFeeDue = daysSinceStart * (group.admin_fee || 0);

    // Calcul du payé réel
    let totalPaidContribution = 0;
    let totalPaidPenalty = 0;
    let totalPaidFee = 0;

    attendances.forEach((att) => {
        if (att.status === 'PAID' || att.status === 'LATE') {
            totalPaidContribution += att.amount_paid;
            // Fee logic: count what is actually paid
            totalPaidFee += (att.fee_paid || 0);
        }
        totalPaidPenalty += att.penalty_paid;
    });

    // Jours payés (basé sur le montant contribution, le fee est accessoire pour le status 'retard')
    const paidDays = Math.floor(totalPaidContribution / group.contribution_amount);

    const daysLate = Math.max(0, daysSinceStart - paidDays);

    // Calcul pénalités
    const currentPenaltyDue = daysLate * group.penalty_per_day;

    // Total dû aujourd'hui pour être à jour
    // Balance = (Contributions Payées + Pénalités Payées + Frais Payés) - (Contributions Dues + Pénalités Dues + Frais Dus)
    const balance = (totalPaidContribution + totalPaidPenalty + totalPaidFee) - (totalContributionDue + totalFeeDue + currentPenaltyDue);

    // Détermination du statut suggéré
    let newStatus: Member['status'] = 'ACTIVE';

    if (daysLate >= 12) {
        newStatus = 'EXCLUDED';
    } else if (daysLate >= 4) {
        newStatus = 'ALERT_8J';
    }

    return {
        totalContributionDue,
        totalPenaltyDue: currentPenaltyDue,
        totalPaid: totalPaidContribution,
        balance, // Si négatif, c'est ce qu'il doit payer
        daysLate,
        status: newStatus,
    };
}

export interface PaymentSimulation {
    totalCovered: number;
    breakdown: {
        contributions: number;
        penalties: number;
        fees: number;
    };
    steps: {
        date: string;
        payPenalty: boolean;
        payFee: boolean;
        payContrib: boolean;
        penaltyCost: number;
        feeCost: number;
        contribCost: number;
    }[];
    remainingAmount: number;
}

export function simulatePaymentDistribution(
    memberId: string,
    amount: number,
    group: Group,
    attendances: Attendance[],
    referenceDate: Date = new Date()
): PaymentSimulation {
    let remainingAmount = amount;
    const steps: PaymentSimulation['steps'] = [];
    let breakdown = { contributions: 0, penalties: 0, fees: 0 };

    // Group Start
    const groupStart = parseISO(group.start_date);
    const refDate = startOfDay(referenceDate);

    // Paid History Map
    const attendanceMap = new Map<string, Attendance>();
    attendances.filter(a => a.member_id === memberId).forEach(a => {
        attendanceMap.set(a.date.split('T')[0], a);
    });

    let currentIterDate = groupStart;
    let safetyCounter = 0;

    while (remainingAmount > 0 && safetyCounter < 365 * 2) {
        const dateStr = currentIterDate.toISOString().split('T')[0];
        const existingAtt = attendanceMap.get(dateStr);

        // Strict Late Rule: Late if strictly past today (refDate > iterDate)
        // Adjust based on business rules if needed
        const isStrictlyLate = differenceInCalendarDays(refDate, currentIterDate) >= 1;

        let penaltyCost = 0;
        let feeCost = 0;
        let contribCost = 0;

        // 1. Calculate Costs
        if (isStrictlyLate) {
            const alreadyPaidPenalty = existingAtt?.penalty_paid || 0;
            const penaltyInfo = group.penalty_per_day || 0;
            if (alreadyPaidPenalty < penaltyInfo) {
                penaltyCost = penaltyInfo - alreadyPaidPenalty;
            }
        }

        const alreadyPaidFee = existingAtt?.fee_paid || 0;
        const feeInfo = group.admin_fee || 0;
        if (alreadyPaidFee < feeInfo) {
            feeCost = feeInfo - alreadyPaidFee;
        }

        const alreadyPaidContrib = existingAtt && existingAtt.status === 'PAID' ? group.contribution_amount : 0;
        const contribInfo = group.contribution_amount;
        if (alreadyPaidContrib < contribInfo) {
            contribCost = contribInfo - alreadyPaidContrib;
        }

        // 2. Try to Pay (Waterfall)
        let payPenalty = false;
        let payFee = false;
        let payContrib = false;

        // Pay Penalty
        if (penaltyCost > 0 && remainingAmount >= penaltyCost) {
            remainingAmount -= penaltyCost;
            payPenalty = true;
            breakdown.penalties++;
        } else if (penaltyCost > 0) {
            break; // Stop if can't pay mandatory penalty
        }

        // Pay Fee
        if (feeCost > 0 && remainingAmount >= feeCost) {
            remainingAmount -= feeCost;
            payFee = true;
            breakdown.fees++;
        } else if (feeCost > 0) {
            break; // Stop if can't pay mandatory fee
        }

        // Pay Contribution
        if (contribCost > 0 && remainingAmount >= contribCost) {
            remainingAmount -= contribCost;
            payContrib = true;
            breakdown.contributions++;
        } else if (contribCost > 0) {
            break; // Stop if can't pay contribution
        }

        if (payPenalty || payFee || payContrib) {
            steps.push({
                date: dateStr,
                payPenalty,
                payFee,
                payContrib,
                penaltyCost: payPenalty ? penaltyCost : 0,
                feeCost: payFee ? feeCost : 0,
                contribCost: payContrib ? contribCost : 0
            });
        }

        // Next Day
        currentIterDate.setDate(currentIterDate.getDate() + 1);
        safetyCounter++;
    }

    return {
        totalCovered: breakdown.contributions, // Usually what users care about "days paid"
        breakdown,
        steps,
        remainingAmount
    };
}
