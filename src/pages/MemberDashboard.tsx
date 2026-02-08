import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, Wallet } from 'lucide-react';

export const MemberDashboard: React.FC = () => {
    const { memberSession, logoutMember, attendances, pots, fetchData, isLoading } = useStore();
    const navigate = useNavigate();

    if (!memberSession) {
        return <Navigate to="/member-login" replace />;
    }

    // Defensive: Ensure data is loaded on mount
    useEffect(() => {
        // If attendances and pots are empty, try to load data
        if (memberSession && memberSession.group_id && attendances.length === 0 && pots.length === 0 && !isLoading) {
            fetchData(memberSession.group_id);
        }
    }, [memberSession, attendances.length, pots.length, fetchData, isLoading]);

    const handleLogout = () => {
        logoutMember();
        navigate('/member-login');
    };

    // Filtrer les données pour ce membre uniquement
    const myAttendances = attendances
        .filter(a => a.member_id === memberSession.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Tri décroissant (plus récent en premier)

    const myPots = pots.filter(p => p.member_id === memberSession.id);

    // Calculs
    const totalContributed = myAttendances.reduce((sum, a) => sum + (a.amount_paid || 0), 0);

    // Prochaine distribution globale (pour la carte en haut)
    const nextGlobalPot = pots
        .filter(p => p.status === 'PENDING')
        .sort((a, b) => new Date(a.distribution_date).getTime() - new Date(b.distribution_date).getTime())[0];

    // Prochain gain du membre (pour la section détaillée)
    // On cherche le premier PENDING trié par date (le store ne garantit pas le tri, donc on trie par sécurité)
    const myNextPot = myPots
        .filter(p => p.status === 'PENDING')
        .sort((a, b) => new Date(a.distribution_date).getTime() - new Date(b.distribution_date).getTime())[0];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Mobile */}
            <div className="bg-emerald-700 text-white p-6 rounded-b-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User size={120} />
                </div>
                <div className="flex justify-between items-start relative z-10">
                    <div>
                        <p className="text-emerald-100 text-sm">Bienvenue,</p>
                        <h1 className="text-2xl font-bold">{memberSession.full_name}</h1>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs backdrop-blur-sm">
                            Membre
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                        title="Se déconnecter"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Résumé Cotisations */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                        <div className="text-emerald-100 text-xs mb-1">Total Cotisé</div>
                        <div className="text-xl font-bold">{totalContributed.toLocaleString()} F</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
                        <div className="text-emerald-100 text-xs mb-1">Prochaine Distribution</div>
                        <div className="text-lg font-bold">{nextGlobalPot ? new Date(nextGlobalPot.distribution_date).toLocaleDateString('fr-FR') : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-6">

                {/* Votre tour de gain */}
                {myNextPot && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-3 text-emerald-800">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Wallet size={20} />
                            </div>
                            <h3 className="font-bold">Votre Tour de Gain</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                            Vous recevrez votre tontine le :
                        </p>
                        <div className="text-2xl font-bold text-gray-900">
                            {new Date(myNextPot.distribution_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="mt-3 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                            Montant prévu : {myNextPot.amount.toLocaleString()} FCFA
                        </div>
                    </div>
                )}

                {/* Cagnotte déjà reçue */}
                {!myNextPot && myPots.length > 0 && (() => {
                    // Trouver le dernier pot complété (le plus récent)
                    const completedPot = myPots
                        .filter(p => p.status === 'COMPLETED')
                        .sort((a, b) => new Date(b.distribution_date).getTime() - new Date(a.distribution_date).getTime())[0];

                    if (!completedPot) return null;

                    return (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 shadow-sm border border-gray-200">
                            <div className="flex items-center gap-3 mb-3 text-gray-700">
                                <div className="p-2 bg-gray-200 rounded-lg">
                                    <Wallet size={20} />
                                </div>
                                <h3 className="font-bold">Votre Cagnotte</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">
                                ✅ Vous avez déjà reçu votre tontine le :
                            </p>
                            <div className="text-2xl font-bold text-gray-900">
                                {new Date(completedPot.distribution_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="mt-3 text-sm text-gray-600 font-medium bg-gray-200 px-3 py-1.5 rounded-lg inline-block">
                                Montant reçu : {completedPot.amount.toLocaleString()} FCFA
                            </div>
                        </div>
                    );
                })()}

                {/* Historique rapide */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">Dernières Activités</h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {myAttendances.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Aucune cotisation enregistrée.
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-gray-100">
                                    {myAttendances.slice(0, 5).map(attendance => (
                                        <div key={attendance.id} className="p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-full text-gray-400">
                                                    <Calendar size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">Cotisation</div>
                                                    <div className="text-xs text-gray-500">{new Date(attendance.date).toLocaleDateString('fr-FR')}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">+{attendance.amount_paid} F</div>
                                                <div className={attendance.status === 'LATE' ? 'text-red-500 text-xs' : 'text-green-500 text-xs'}>
                                                    {attendance.status === 'LATE' ? 'En retard' : 'Payé'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {myAttendances.length > 5 && (
                                    <button
                                        onClick={() => navigate('/member-history')}
                                        className="w-full p-4 text-center text-emerald-600 hover:bg-emerald-50 font-medium text-sm transition border-t border-gray-100"
                                    >
                                        Voir tout l'historique ({myAttendances.length} transactions)
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
