import { create } from 'zustand';
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns';
import type { Group, Member, Attendance, PotDistribution } from '../types';
import { supabase } from '../lib/supabaseClient';


interface AppState {
    currentGroup: Group | null;
    groups: Group[];
    members: Member[];
    attendances: Attendance[];
    pots: PotDistribution[];

    isLoading: boolean;
    memberSession: Member | null; // Session membre active
    unlockedGroupIds: string[]; // IDs des groupes déverrouillés pour la session courante

    // Actions
    fetchData: (groupId: string) => Promise<void>;
    markAttendance: (memberId: string, date: string, status: Attendance['status'], penaltyPaid?: boolean, feePaid?: boolean) => Promise<void>;
    setCurrentGroup: (group: Group) => void;
    quitGroup: () => void; // New action to clear selection
    generatePayouts: (groupId: string, members: Member[], startDate: string, rotationDays: number) => Promise<void>;
    validatePayout: (potId: string) => Promise<void>;
    subscribeToUpdates: (groupId: string) => void;
    unsubscribeFromUpdates: () => void;
    unlockGroup: (groupId: string, password: string) => Promise<boolean>;
    // CRUD Actions
    addGroup: (name: string, amount: number, rotation: number, start: string, password?: string, penalty?: number, adminFee?: number) => Promise<void>;
    updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;
    addMember: (groupId: string, name: string, phone: string, pinCode: string) => Promise<void>;
    loginMember: (name: string, pinCode: string) => Promise<boolean>;
    logoutMember: () => void;
    updateMember: (memberId: string, updates: Partial<Member>) => Promise<void>;
    deleteMember: (memberId: string) => Promise<void>;
    updatePotDate: (potId: string, newDate: string) => Promise<void>;
    processBulkPayment: (memberId: string, amount: number) => Promise<void>;
}

// Mocks supprimés car connexion DB active

export const useStore = create<AppState>((set, get) => ({
    currentGroup: null,
    groups: [],
    members: [],
    attendances: [],
    pots: [],
    isLoading: false,
    memberSession: null,
    unlockedGroupIds: [],

    fetchData: async (_groupId: string) => {
        set({ isLoading: true });
        try {
            // 1. Récupérer TOUS les groupes
            let groupData: Group | null = get().currentGroup;
            const { data: groups, error: groupError } = await supabase.from('groups').select('*');
            if (groupError) throw groupError;

            // Update groups list immediately
            if (groups) {
                set({ groups: groups as Group[] });
            }

            if (groups && groups.length > 0) {
                // Determine which group to select as current
                // Case 1: Specific ID provided (switching groups)
                if (_groupId && _groupId !== 'auto') {
                    const found = groups.find(g => g.id === _groupId);
                    if (found) {
                        groupData = found;
                    }
                }
                // Case 2: Auto-select (first load or explicit auto)
                else if (_groupId === 'auto') {
                    groupData = groups[0] as Group;
                }
                // Case 3: No specific ID, keep current if valid
                else if (groupData) {
                    const stillExists = groups.find(g => g.id === groupData?.id);
                    if (!stillExists) groupData = null;
                }
            } else {
                groupData = null;
            }

            // If no group is selected, we stop here but KEEP the groups list
            if (!groupData) {
                set({
                    isLoading: false,
                    currentGroup: null,
                    // groups is already set above, or we can ensure it here
                    groups: (groups as Group[]) || []
                });
                return;
            }

            // check security
            const isLocked = groupData.password && !get().unlockedGroupIds.includes(groupData.id);
            if (isLocked) {
                // Si verrouillé, on met juste à jour le groupe courant (pour l'UI) mais pas les données sensibles
                set({
                    currentGroup: groupData,
                    groups: (groups as Group[]) || [],
                    members: [],
                    attendances: [],
                    pots: [],
                    isLoading: false
                });
                return;
            }

            // 2. Récupérer les membres
            const { data: members, error: memberError } = await supabase
                .from('members')
                .select('*')
                .eq('group_id', groupData.id);
            if (memberError) throw memberError;

            // 3. Récupérer les pointages
            const membersList = members as Member[] | null;
            const memberIds = membersList?.map((m) => m.id) || [];
            let attendanceData: Attendance[] = [];
            let potsData: PotDistribution[] = [];

            if (memberIds.length > 0) {
                const { data: attendances, error: attendanceError } = await supabase
                    .from('attendance')
                    .select('*')
                    .in('member_id', memberIds);
                if (attendanceError) throw attendanceError;
                attendanceData = attendances as Attendance[] || [];

                // 4. Récupérer les gains (pots)
                const { data: pots, error: potsError } = await supabase
                    .from('pots')
                    .select('*')
                    .eq('group_id', groupData.id)
                    .order('distribution_date', { ascending: true });
                if (potsError) throw potsError;
                potsData = pots as PotDistribution[] || [];
            }

            set({
                currentGroup: groupData,
                groups: groups as Group[],
                members: members as Member[] || [],
                attendances: attendanceData,
                pots: potsData,
                isLoading: false
            });

        } catch (error) {
            console.error("Erreur chargement:", error);
            set({ isLoading: false });
        }
    },

    setCurrentGroup: (group) => set({ currentGroup: group }),

    quitGroup: () => set({
        currentGroup: null,
        members: [],
        attendances: [],
        pots: []
    }),

    markAttendance: async (memberId, date, status, penaltyPaid = false, feePaid = false) => {
        const { currentGroup, attendances } = get();
        if (!currentGroup) return;

        // Optimistic Update
        const existingIdx = attendances.findIndex(a => a.member_id === memberId && a.date === date);
        const amount_paid = status === 'PAID' ? currentGroup.contribution_amount : 0;

        // Handle penalty logic
        const penalty_val = penaltyPaid ? (currentGroup.penalty_per_day || 200) : 0;

        // Handle fee logic
        const fee_val = feePaid ? (currentGroup.admin_fee || 0) : 0;

        // Creation objet optimistic
        const newAttendanceTemp: Attendance = {
            id: existingIdx >= 0 ? attendances[existingIdx].id : 'temp-' + Date.now(),
            member_id: memberId,
            date,
            status,
            amount_paid,
            penalty_paid: penalty_val,
            fee_paid: fee_val
        };

        const newAttendances = existingIdx >= 0
            ? attendances.map((a, i) => i === existingIdx ? newAttendanceTemp : a)
            : [...attendances, newAttendanceTemp];

        set({ attendances: newAttendances });

        try {
            const { error } = await supabase.from('attendance').upsert({
                member_id: memberId,
                date,
                status,
                amount_paid,
                penalty_paid: penalty_val,
                fee_paid: fee_val
            }, { onConflict: 'member_id,date' });
            if (error) throw error;
            // On pourrait re-fetcher pour avoir le vrai ID
        } catch (error) {
            console.error("Erreur markAttendance:", error);
            // Rollback optimistic (optionnel, simple à implémenter si besoin)
        }
    },

    generatePayouts: async (groupId, members, startDate, rotationDays) => {
        const { currentGroup } = get();
        if (!currentGroup) return;

        // Calculate dynamic pot amount: Contribution * RotationDays * Member Count
        // Explicitly excludes admin_fee
        // 500 * 4 * 100 = 200,000
        const potAmount = (currentGroup.contribution_amount * rotationDays) * members.length;

        // Generate dates logic...
        const payouts: PotDistribution[] = [];
        const start = new Date(startDate);
        // Reset time
        start.setHours(0, 0, 0, 0);

        // Sort members randomly or by join date? Usually random or specific order.
        // For now, we keep existing order but ideally this should be shuffled ONCE and persisted.
        // Re-generating implies a reset.

        members.forEach((member, index) => {
            // Formula: Date = Start + (Index * Rotation) + Rotation (Pay at end of cycle?) or Start + (Index * Rotation)
            // Usually Tontine pays at the MEETING.
            // Meeting 1 = Start Date? Or Start + Rotation?
            // Let's assume Meeting 1 = Start + Rotation.

            const payoutDate = new Date(start);
            payoutDate.setDate(start.getDate() + ((index + 1) * rotationDays));

            payouts.push({
                id: `pot-${Date.now()}-${index}`,
                group_id: groupId,
                member_id: member.id,
                distribution_date: payoutDate.toISOString().split('T')[0],
                amount: potAmount,
                status: 'PENDING'
            });
        });

        // Optimistic Update
        set({ pots: payouts });

        // Persist to DB (Delete old, Insert new)
        try {
            await supabase.from('pots').delete().eq('group_id', groupId);
            const { error } = await supabase.from('pots').insert(payouts.map(p => ({
                group_id: p.group_id,
                member_id: p.member_id,
                distribution_date: p.distribution_date,
                amount: p.amount,
                status: p.status
            })));
            if (error) throw error;
        } catch (e) {
            console.error("Error generating payouts:", e);
        }
    },

    validatePayout: async (potId) => {
        // Optimistic
        set(state => ({
            pots: state.pots.map(p => p.id === potId ? { ...p, status: 'COMPLETED' } : p)
        }));

        try {
            const { error } = await supabase.from('pots').update({ status: 'COMPLETED' }).eq('id', potId);
            if (error) throw error;
        } catch (e) {
            console.error("Erreur validation gain:", e);
            // Rollback? complex here, ignoring for MVP
        }
    },

    subscribeToUpdates: (groupId) => {
        supabase
            .channel('public:data')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'attendance' },
                (payload) => {
                    // Refresh data or update local state smartly
                    // Basic strategy: reload data or update
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        const newRecord = payload.new as Attendance;
                        set(state => {
                            const idx = state.attendances.findIndex(a => a.id === newRecord.id);
                            if (idx >= 0) {
                                const updated = [...state.attendances];
                                updated[idx] = newRecord;
                                return { attendances: updated };
                            } else {
                                return { attendances: [...state.attendances, newRecord] };
                            }
                        });
                    }
                }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pots', filter: `group_id=eq.${groupId}` },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        const newRecord = payload.new as PotDistribution;
                        set(state => ({
                            pots: state.pots.map(p => p.id === newRecord.id ? newRecord : p)
                        }));
                    }
                }
            )
            .subscribe();

        // Store channel to unsubscribe later if needed (not implemented in interface but good practice)
    },

    unsubscribeFromUpdates: () => {
        supabase.removeAllChannels();
    },

    unlockGroup: async (groupId, password) => {
        // En vrai app, vérifier via RPC. Ici on compare avec le hash local ou la valeur chargée (si on l'a).
        // Attention: Pour que ça marche "secure" front-only sans RPC, il faudrait que le select return le password
        // SEULEMENT si on le connait... C'est pas ouf niveau sécu pure mais pour MVP Local-first :
        // On va supposer que `fetchData` a chargé les groupes AVEC le champ password (qui est donc visible dans le network tab par l'admin authentifié Supabase).
        // Puisqu'on est admin, on a le droit de voir. Le but est d'empêcher un accès UI accidentel ou "épaule".

        const group = get().groups.find(g => g.id === groupId);
        if (!group) return false;

        // Comparaison directe (ou hash si on avait implémenté bcrypt)
        if (group.password === password) {
            set(state => ({
                unlockedGroupIds: [...state.unlockedGroupIds, groupId]
            }));
            // Charger les données maintenant que c'est débloqué
            get().fetchData(groupId);
            return true;
        }
        return false;
    },

    // --- CRUD IMPLEMENTATION ---
    addGroup: async (name, amount, rotation, start, password, penalty = 200, adminFee = 0) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.from('groups').insert({
                name,
                contribution_amount: amount,
                pot_amount: amount * 0, // Sera mis à jour ou calculé
                rotation_days: rotation,
                start_date: start,
                penalty_per_day: penalty,
                admin_fee: adminFee,
                password: password || null
            }).select().single();

            if (error) throw error;

            set(state => ({
                groups: [...state.groups, data as Group],
                currentGroup: data as Group,
                unlockedGroupIds: [...state.unlockedGroupIds, data.id], // Auto-unlock created group
                isLoading: false
            }));

            // Force refresh to ensure everything is in sync
            get().fetchData(data.id);
        } catch (e) {
            console.error("Error creating group:", e);
            set({ isLoading: false });
        }
    },

    updateGroup: async (groupId, updates) => {
        set({ isLoading: true });
        try {
            // 1. Update Group Data
            const { data: updatedGroup, error } = await supabase.from('groups')
                .update({
                    name: updates.name,
                    contribution_amount: updates.contribution_amount,
                    rotation_days: updates.rotation_days,
                    start_date: updates.start_date,
                    penalty_per_day: updates.penalty_per_day,
                    admin_fee: updates.admin_fee,
                    password: updates.password || null
                })
                .eq('id', groupId)
                .select().single();

            if (error) throw error;

            // 2. CHECK IF RECALCULATION IS NEEDED
            // We need the OLD group data (or just assume if these keys are present in updates, we recalc)
            // Safer: If start_date OR rotation_days are in updates, we Trigger Recalc.
            const shouldRecalculate = (updates.start_date !== undefined) || (updates.rotation_days !== undefined);

            if (shouldRecalculate) {
                // Fetch existing pots to recalculate them
                const { data: currentPots, error: potsError } = await supabase
                    .from('pots')
                    .select('*')
                    .eq('group_id', groupId)
                    .order('distribution_date', { ascending: true }); // Important: Maintain original order

                if (!potsError && currentPots && currentPots.length > 0) {
                    const newStart = updates.start_date || (get().groups.find(g => g.id === groupId)?.start_date) || new Date().toISOString();
                    const newRotation = updates.rotation_days || (get().groups.find(g => g.id === groupId)?.rotation_days) || 7;
                    const startDateObj = new Date(newStart);

                    // Prepare updates
                    const updatesToRun = currentPots.map((pot, index) => {
                        // Logic: NewDate = Start + ((index + 1) * Rotation) - 1 (Inclusive)
                        const nextDate = new Date(startDateObj);
                        nextDate.setDate(startDateObj.getDate() + ((index + 1) * newRotation) - 1);

                        return {
                            id: pot.id,
                            distribution_date: nextDate.toISOString().split('T')[0]
                        };
                    });

                    // Execute updates (Parallel or Batch? Supabase upsert requires unique constraint. 
                    // Update one by one is safer for now without changing schema uniqueness)
                    // Optimization: We could use upsert if we had all fields, but we only update date.
                    // Let's do parallel updates.
                    await Promise.all(updatesToRun.map(u =>
                        supabase.from('pots').update({ distribution_date: u.distribution_date }).eq('id', u.id)
                    ));

                    // Update local state pots if this is current group
                    if (get().currentGroup?.id === groupId) {
                        // We need to refresh pots because dates changed
                        const { data: refreshedPots } = await supabase.from('pots').select('*').eq('group_id', groupId).order('distribution_date');
                        if (refreshedPots) set({ pots: refreshedPots as PotDistribution[] });
                    }
                }
            }

            set(state => ({
                groups: state.groups.map(g => g.id === groupId ? (updatedGroup as Group) : g),
                currentGroup: state.currentGroup?.id === groupId ? (updatedGroup as Group) : state.currentGroup,
                isLoading: false
            }));

        } catch (e) {
            console.error("Error updating group:", e);
            set({ isLoading: false });
        }
    },

    deleteGroup: async (groupId) => {
        set({ isLoading: true });
        try {
            // Note: Postgres CASCADE delete should handle related data if configured.
            // If not, we should delete related data first. Assuming CASCADE here or simple deletion.
            const { error } = await supabase.from('groups').delete().eq('id', groupId);
            if (error) throw error;

            set(state => ({
                groups: state.groups.filter(g => g.id !== groupId),
                currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup,
                isLoading: false
            }));
        } catch (e) {
            console.error("Error deleting group:", e);
            set({ isLoading: false });
        }
    },

    addMember: async (groupId, name, phone, pinCode) => {
        try {
            const { data, error } = await supabase.from('members').insert({
                group_id: groupId,
                full_name: name,
                phone: phone,
                pin_code: pinCode,
                status: 'ACTIVE',
                join_date: new Date().toISOString().split('T')[0]
            }).select().single();

            if (error) throw error;

            set(state => ({
                members: [...state.members, data as Member]
            }));
        } catch (e) {
            console.error("Error adding member:", e);
        }
    },

    updateMember: async (memberId, updates) => {
        try {
            const { data, error } = await supabase.from('members')
                .update(updates)
                .eq('id', memberId)
                .select().single();

            if (error) throw error;

            set(state => ({
                members: state.members.map(m => m.id === memberId ? (data as Member) : m)
            }));
        } catch (e: any) {
            console.error("Error updating member:", e);
            alert(`Erreur lors de la mise à jour: ${e.message || e.error_description || JSON.stringify(e)}`);
        }
    },

    deleteMember: async (memberId) => {
        try {
            const { error } = await supabase.from('members').delete().eq('id', memberId);
            if (error) throw error;

            set(state => ({
                members: state.members.filter(m => m.id !== memberId)
            }));
        } catch (e) {
            console.error("Error deleting member:", e);
        }
    },

    updatePotDate: async (potId, newDate) => {
        try {
            const { error } = await supabase.from('pots').update({ distribution_date: newDate }).eq('id', potId);
            if (error) throw error;

            set(state => ({
                pots: state.pots.map(p => p.id === potId ? { ...p, distribution_date: newDate } : p)
            }));
        } catch (e) {
            console.error("Error updating pot date:", e);
        }
    },

    processBulkPayment: async (memberId: string, amount: number) => {
        const { currentGroup, attendances, markAttendance } = get();
        if (!currentGroup || amount <= 0) return;

        let remainingAmount = amount;

        // --- 1. PREPARATION ---
        const groupStart = parseISO(currentGroup.start_date);
        const refDate = startOfDay(new Date()); // Aujourd'hui 00:00

        // Get paid history for quick lookup
        // Key: "YYYY-MM-DD", Value: Attendance Object
        const attendanceMap = new Map<string, Attendance>();
        attendances.filter(a => a.member_id === memberId).forEach(a => {
            attendanceMap.set(a.date.split('T')[0], a);
        });

        // Determine Start of Check (Group Start)
        // We will iterate day by day from Group Start until money runs out OR we reach a reasonable future limit (e.g. 1 year)
        // Note: In Tontine, you pay for EVERY meeting/day in the cycle. 
        // Assuming daily frequency based on the loop in the original code, 
        // BUT logic/calculations says "daysSinceStart * contribution". 
        // So we assume it's a daily tontine for simplicity given the "penalty PER DAY" naming.

        // If rotation_days > 1, does it mean contribution is every X days? 
        // Validating with `calculations.ts`: `totalContributionDue = daysSinceStart * group.contribution_amount`
        // This implies DAILY contribution regardless of rotation. Rotation usually for Payout.

        let currentIterDate = groupStart;
        let safetyCounter = 0;

        // --- 2. PAYMENT LOOP ---
        while (remainingAmount > 0 && safetyCounter < 365 * 2) {
            const dateStr = currentIterDate.toISOString().split('T')[0];

            // Existing record or empty
            const existingAtt = attendanceMap.get(dateStr);
            // Note: If today (diff=0), it becomes late after 20H UTC. 
            // For bulk payment simplicity, we consider today as "Due" but maybe not "Late" for penalty 
            // unless we are stricter. 

            // Check specific late rule from calculations.ts
            // "If today < 20H, daysSinceStart - 1". 
            // Means Today is NOT late yet.
            const isStrictlyLate = differenceInCalendarDays(refDate, currentIterDate) >= 1;

            // --- COST CALCULATION ---
            let penaltyCost = 0;
            let feeCost = 0;
            let contributionCost = 0;

            // 1. PENALTY
            // Applies if strictly late AND not fully paid
            if (isStrictlyLate) {
                const alreadyPaidPenalty = existingAtt?.penalty_paid || 0;
                const penaltyInfo = currentGroup.penalty_per_day || 0;
                if (alreadyPaidPenalty < penaltyInfo) {
                    penaltyCost = penaltyInfo - alreadyPaidPenalty;
                }
            }

            // 2. FEE (Admin Fee)
            // Applies always if defined
            const alreadyPaidFee = existingAtt?.fee_paid || 0;
            const feeInfo = currentGroup.admin_fee || 0;
            if (alreadyPaidFee < feeInfo) {
                feeCost = feeInfo - alreadyPaidFee;
            }

            // 3. CONTRIBUTION
            const alreadyPaidContrib = existingAtt && existingAtt.status === 'PAID' ? currentGroup.contribution_amount : 0;
            const contribInfo = currentGroup.contribution_amount;
            if (alreadyPaidContrib < contribInfo) {
                contributionCost = contribInfo - alreadyPaidContrib;
            }

            // --- DEDUCTION LOGIC (Waterfall) ---

            let payPenalty = false;
            let payFee = false;
            let payContrib = false;

            // Pay Penalty First
            if (penaltyCost > 0 && remainingAmount >= penaltyCost) {
                remainingAmount -= penaltyCost;
                payPenalty = true;
            } else if (penaltyCost > 0) {
                // Not enough for penalty -> Stop or Partial? 
                // Requirement: "n'arrive pas à prendre en compte..." implies we must pay it.
                // Usually bulk payment stops if it can't pay a full item? 
                // Let's strict stop to avoid partial nightmare.
                break;
            }

            // Pay Fee Second
            if (feeCost > 0 && remainingAmount >= feeCost) {
                remainingAmount -= feeCost;
                payFee = true;
            } else if (feeCost > 0) {
                break;
            }

            // Pay Contribution Third
            if (contributionCost > 0 && remainingAmount >= contributionCost) {
                remainingAmount -= contributionCost;
                payContrib = true;
            } else if (contributionCost > 0) {
                break;
            }

            // --- UPDATE STATE IF CHANGED ---
            if (payPenalty || payFee || payContrib) {
                // Determine new status
                const newStatus = (payContrib || (existingAtt?.status === 'PAID')) ? 'PAID' : (existingAtt?.status || 'PENDING');

                // Determine cumulative paid amounts
                const finalPenaltyPaid = (existingAtt?.penalty_paid || 0) + (payPenalty ? penaltyCost : 0); // Should be full amount
                const finalFeePaid = (existingAtt?.fee_paid || 0) + (payFee ? feeCost : 0);

                // IMPORTANT: We use markAttendance which expects booleans for "isPaid", 
                // but here we are dealing with partial states or complex updates.
                // markAttendance is simple wrapper. Let's call it smartly or direct update? 
                // markAttendance sign: (id, date, status, penaltyPaid(bool), feePaid(bool))
                // It sets value to MAX if true.

                const isPenaltyFullyPaid = finalPenaltyPaid >= (currentGroup.penalty_per_day || 0);
                const isFeeFullyPaid = finalFeePaid >= (currentGroup.admin_fee || 0);

                // Note: processBulkPayment calls markAttendance sequentially. 
                // This might be slow for many days. Optimistic update is handled in markAttendance.
                // We await to ensure order.
                await markAttendance(memberId, dateStr, newStatus, isPenaltyFullyPaid, isFeeFullyPaid);
            }

            // Move to next day
            currentIterDate.setDate(currentIterDate.getDate() + 1);
            safetyCounter++;
        }
    },

    loginMember: async (name, pinCode) => {
        set({ isLoading: true });
        try {
            // Note: In real app, avoid fetching PIN. Use RPC or Edge Function to verify.
            // For MVP: we query with exact match.
            // Using ilike for name to be case insensitive
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .ilike('full_name', name)
                .eq('pin_code', pinCode)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                set({ memberSession: data as Member, isLoading: false });
                return true;
            } else {
                set({ isLoading: false });
                return false;
            }
        } catch (error) {
            console.error("Login Member Error:", error);
            set({ isLoading: false });
            return false;
        }
    },

    logoutMember: () => {
        set({ memberSession: null });
    }
}));
