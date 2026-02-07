import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { TrendingUp, AlertTriangle, Wallet, PlusCircle } from 'lucide-react';
import clsx from 'clsx';
import { GroupLoginModal } from '../components/GroupLoginModal';
import { Link } from 'react-router-dom';



export const Dashboard: React.FC = () => {
    const { currentGroup, groups, members, attendances, isLoading, fetchData } = useStore();

    // Subscribe to realtime updates
    React.useEffect(() => {
        if (currentGroup) {
            useStore.getState().subscribeToUpdates(currentGroup.id);
        }
        return () => {
            useStore.getState().unsubscribeFromUpdates();
        };
    }, [currentGroup?.id]);

    const hasMembers = members.some(m => m.group_id === currentGroup?.id);

    // Group Login Modal State
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const groupId = e.target.value;
        const group = groups.find(g => g.id === groupId);
        const unlockedIds = useStore.getState().unlockedGroupIds;

        if (group?.password && !unlockedIds.includes(groupId)) {
            setPendingGroupId(groupId);
            setIsLoginModalOpen(true);
        } else {
            fetchData(groupId);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64 text-gray-400">Chargement des données...</div>;
    }

    if (!currentGroup && groups.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-4 text-center space-y-4">
                <div className="bg-gray-50 p-4 rounded-full">
                    <AlertTriangle size={48} className="text-gray-300" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Bienvenue dans Tontine Pro</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">Commencez par créer votre première tontine depuis l'accueil.</p>
                </div>
                <Link
                    to="/"
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition transform hover:scale-105"
                >
                    <PlusCircle size={20} />
                    <span>Aller à l'accueil</span>
                </Link>
            </div>
        );
    }

    // Real calculations
    const totalPot = currentGroup?.pot_amount || 0;
    const collectedAmount = attendances.reduce((sum, a) => sum + (a.amount_paid || 0), 0);
    const penaltyAmount = attendances.reduce((sum, a) => sum + (a.penalty_paid || 0), 0);
    const alertsCount = members.filter(m => m.status === 'ALERT_8J').length;

    // Check if check-in is done for today
    const today = new Date().toISOString().split('T')[0];
    const todaysAttendances = attendances.filter(a => a.date === today);
    const sessionValidated = todaysAttendances.length > 0;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
                    <p className="text-gray-500 text-sm">Vue d'ensemble</p>
                </div>
                {groups.length > 0 && (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={currentGroup?.id || ''}
                                onChange={handleGroupChange}
                                className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 pr-8 font-medium shadow-sm"
                            >
                                {groups.map(group => (
                                    <option key={group.id} value={group.id}>
                                        {group.name} {group.password && !useStore.getState().unlockedGroupIds.includes(group.id) ? '🔒' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State for Members */}
            {currentGroup && !hasMembers && !isLoading && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-indigo-500">
                        <PlusCircle size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-indigo-900">Groupe "{currentGroup.name}" créé !</h3>
                        <p className="text-indigo-700 mt-1 max-w-sm mx-auto">
                            Ce groupe est actuellement vide. Ajoutez dès maintenant les participants pour démarrer les cotisations.
                        </p>
                    </div>
                    <Link
                        to="/members"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition transform hover:scale-105"
                    >
                        <span>Ajouter des Membres</span>
                        <TrendingUp size={18} className="transform rotate-90" />
                    </Link>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-5 text-white shadow-lg shadow-primary-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Wallet size={24} className="text-white" />
                        </div>
                        <span className="text-primary-100 text-xs font-medium bg-white/10 px-2 py-1 rounded-full">En caisse</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{collectedAmount.toLocaleString()} FCFA</div>
                    <p className="text-primary-100 text-sm opacity-80">Sur {totalPot.toLocaleString()} attendus</p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-danger-600">
                        <TrendingUp size={20} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Pénalités</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{penaltyAmount.toLocaleString()}</div>
                    <p className="text-xs text-gray-400">FCFA encaissés</p>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2 text-orange-500">
                        <AlertTriangle size={20} />
                        <span className="text-xs font-semibold uppercase tracking-wider">Alertes</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{alertsCount}</div>
                    <p className="text-xs text-gray-400">Membres à risque</p>
                </div>
            </div>

            {/* Action Rapide */}
            <div className={clsx(
                "rounded-xl p-4 border",
                sessionValidated ? "bg-green-50 border-green-100" : "bg-primary-50 border-primary-100"
            )}>
                <h3 className={clsx("font-semibold mb-1", sessionValidated ? "text-green-900" : "text-primary-900")}>
                    Session du jour ({new Date().toLocaleDateString('fr-FR')})
                </h3>
                <p className={clsx("text-sm mb-3", sessionValidated ? "text-green-700" : "text-primary-700")}>
                    {sessionValidated
                        ? `${todaysAttendances.length} membres ont été pointés aujourd'hui.`
                        : "Le pointage n'a pas encore été validé."}
                </p>
                <Link to="/checkin" className={clsx(
                    "block w-full text-center font-medium py-2 rounded-lg transition",
                    sessionValidated ? "bg-green-600 text-white hover:bg-green-700" : "bg-primary-600 text-white hover:bg-primary-700"
                )}>
                    {sessionValidated ? 'Voir / Modifier le pointage' : 'Lancer le pointage'}
                </Link>
            </div>

            <GroupLoginModal
                isOpen={isLoginModalOpen}
                groupId={pendingGroupId}
                onClose={() => {
                    setIsLoginModalOpen(false);
                    setPendingGroupId(null);
                }}
                onSuccess={() => {
                    // Refresh explicitly to perform the switch (fetchData is called by unlockGroup, but we want to confirm)
                }}
            />

            {/* Daily Totals Link Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-primary-200 transition-all">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-50 text-primary-600 rounded-lg group-hover:bg-primary-100 transition-colors">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">Récapitulatif Journalier</h3>
                        <p className="text-sm text-gray-500">Voir l'historique des cotisations et pénalités</p>
                    </div>
                </div>
                <Link
                    to="/daily-summary"
                    className="flex items-center gap-2 text-primary-600 font-semibold bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                >
                    Voir détails
                    <TrendingUp size={16} />
                </Link>
            </div>
        </div>
    );
};

