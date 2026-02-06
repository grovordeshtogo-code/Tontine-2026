import React from 'react';
import { useStore } from '../store/useStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, User, Calendar, Wallet } from 'lucide-react';

export const MemberDashboard: React.FC = () => {
    const { memberSession, logoutMember, attendances, pots } = useStore();
    const navigate = useNavigate();

    if (!memberSession) {
        return <Navigate to="/member-login" replace />;
    }

    const handleLogout = () => {
        logoutMember();
        navigate('/member-login');
    };

    // Filtrer les données pour ce membre uniquement
    const myAttendances = attendances.filter(a => a.member_id === memberSession.id);
    const myPots = pots.filter(p => p.member_id === memberSession.id);

    // Calculs
    const totalContributed = myAttendances.reduce((sum, a) => sum + (a.amount_paid || 0), 0);
    const nextPot = myPots.find(p => p.status === 'PENDING');

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
                        <div className="text-emerald-100 text-xs mb-1">Prochain Gain</div>
                        <div className="text-lg font-bold">{nextPot ? new Date(nextPot.distribution_date).toLocaleDateString('fr-FR') : '-'}</div>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-4 space-y-6">

                {/* Prochaine distribution */}
                {nextPot && (
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
                            {new Date(nextPot.distribution_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="mt-3 text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                            Montant prévu : {nextPot.amount.toLocaleString()} FCFA
                        </div>
                    </div>
                )}

                {/* Historique rapide */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3 px-1">Dernières Activités</h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {myAttendances.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Aucune cotisation enregistrée.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {myAttendances.slice(-5).reverse().map(attendance => (
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
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
