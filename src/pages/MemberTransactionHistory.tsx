import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

type DateFilter = '7d' | '30d' | 'month' | 'all' | 'custom';

export const MemberTransactionHistory: React.FC = () => {
    const { memberSession, attendances } = useStore();
    const navigate = useNavigate();

    const [dateFilter, setDateFilter] = useState<DateFilter>('30d');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    if (!memberSession) {
        return <Navigate to="/member-login" replace />;
    }

    // Filtrer les données pour ce membre uniquement
    const myAttendances = attendances.filter(a => a.member_id === memberSession.id);

    // Logique de filtrage par date
    const filteredAttendances = useMemo(() => {
        let filtered = [...myAttendances];
        const now = new Date();
        let filterStartDate: Date | null = null;
        let filterEndDate: Date | null = null;

        if (dateFilter === '7d') {
            filterStartDate = subDays(now, 7);
        } else if (dateFilter === '30d') {
            filterStartDate = subDays(now, 30);
        } else if (dateFilter === 'month') {
            filterStartDate = startOfMonth(now);
            filterEndDate = endOfMonth(now);
        } else if (dateFilter === 'custom') {
            if (startDate) filterStartDate = new Date(startDate);
            if (endDate) filterEndDate = new Date(endDate);
        }

        if (filterStartDate) {
            filtered = filtered.filter(a => new Date(a.date) >= filterStartDate!);
        }

        if (filterEndDate) {
            filtered = filtered.filter(a => new Date(a.date) <= filterEndDate!);
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [myAttendances, dateFilter, startDate, endDate]);

    // Statistiques pour la période filtrée
    const stats = useMemo(() => {
        const totalContributed = filteredAttendances.reduce((sum, a) => sum + (a.amount_paid || 0), 0);
        const totalPenalties = filteredAttendances.reduce((sum, a) => sum + (a.penalty_paid || 0), 0);
        const transactionCount = filteredAttendances.length;

        return { totalContributed, totalPenalties, transactionCount };
    }, [filteredAttendances]);

    // Grouper par mois
    const groupedByMonth = useMemo(() => {
        const groups: { [key: string]: typeof filteredAttendances } = {};

        filteredAttendances.forEach(attendance => {
            const monthKey = format(new Date(attendance.date), 'MMMM yyyy', { locale: fr });
            if (!groups[monthKey]) {
                groups[monthKey] = [];
            }
            groups[monthKey].push(attendance);
        });

        return groups;
    }, [filteredAttendances]);

    const handleFilterChange = (filter: DateFilter) => {
        setDateFilter(filter);
        if (filter !== 'custom') {
            setStartDate('');
            setEndDate('');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-emerald-700 text-white p-6 pb-8 rounded-b-3xl shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate('/member-dashboard')}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                        title="Retour"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Historique</h1>
                        <p className="text-emerald-100 text-sm">{memberSession.full_name}</p>
                    </div>
                </div>

                {/* Filtres rapides */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button
                        onClick={() => handleFilterChange('7d')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${dateFilter === '7d'
                                ? 'bg-white text-emerald-700'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        7 jours
                    </button>
                    <button
                        onClick={() => handleFilterChange('30d')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${dateFilter === '30d'
                                ? 'bg-white text-emerald-700'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        30 jours
                    </button>
                    <button
                        onClick={() => handleFilterChange('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${dateFilter === 'month'
                                ? 'bg-white text-emerald-700'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        Ce mois
                    </button>
                    <button
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${dateFilter === 'all'
                                ? 'bg-white text-emerald-700'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        Tout
                    </button>
                    <button
                        onClick={() => handleFilterChange('custom')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${dateFilter === 'custom'
                                ? 'bg-white text-emerald-700'
                                : 'bg-white/10 hover:bg-white/20'
                            }`}
                    >
                        <Filter size={16} />
                        Personnalisé
                    </button>
                </div>

                {/* Filtres personnalisés */}
                {dateFilter === 'custom' && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-emerald-100 mb-1 block">Date début</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-emerald-100 mb-1 block">Date fin</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg text-gray-900 text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Statistiques */}
            <div className="p-4 -mt-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                            <TrendingUp size={16} />
                            <span className="text-xs font-medium">Cotisations</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.totalContributed.toLocaleString()} F</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-red-600 mb-1">
                            <AlertCircle size={16} />
                            <span className="text-xs font-medium">Pénalités</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.totalPenalties.toLocaleString()} F</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                            <Calendar size={16} />
                            <span className="text-xs font-medium">Transactions</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{stats.transactionCount}</div>
                    </div>
                </div>
            </div>

            {/* Liste des transactions */}
            <div className="p-4 pt-2 space-y-6">
                {Object.keys(groupedByMonth).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Aucune transaction</p>
                        <p className="text-gray-400 text-sm mt-1">
                            Aucune transaction trouvée pour cette période
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedByMonth).map(([month, transactions]) => (
                        <div key={month}>
                            <h3 className="text-sm font-bold text-gray-600 mb-3 px-1 uppercase tracking-wide">
                                {month}
                            </h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                                {transactions.map(attendance => (
                                    <div key={attendance.id} className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${attendance.status === 'LATE'
                                                        ? 'bg-red-50 text-red-500'
                                                        : 'bg-emerald-50 text-emerald-500'
                                                    }`}>
                                                    <Calendar size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {format(new Date(attendance.date), 'EEEE d MMMM yyyy', { locale: fr })}
                                                    </div>
                                                    <div className={`text-xs font-medium ${attendance.status === 'LATE'
                                                            ? 'text-red-500'
                                                            : attendance.status === 'PAID'
                                                                ? 'text-emerald-500'
                                                                : 'text-orange-500'
                                                        }`}>
                                                        {attendance.status === 'LATE'
                                                            ? 'En retard'
                                                            : attendance.status === 'PAID'
                                                                ? 'Payé'
                                                                : 'En attente'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-11 space-y-1">
                                            {attendance.amount_paid > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Cotisation</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {attendance.amount_paid.toLocaleString()} F
                                                    </span>
                                                </div>
                                            )}
                                            {attendance.penalty_paid > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-600">Pénalité</span>
                                                    <span className="font-semibold text-red-600">
                                                        +{attendance.penalty_paid.toLocaleString()} F
                                                    </span>
                                                </div>
                                            )}
                                            {attendance.fee_paid > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-blue-600">Frais</span>
                                                    <span className="font-semibold text-blue-600">
                                                        +{attendance.fee_paid.toLocaleString()} F
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm pt-1 border-t border-gray-100 mt-2">
                                                <span className="text-gray-700 font-medium">Total</span>
                                                <span className="font-bold text-gray-900">
                                                    {(attendance.amount_paid + attendance.penalty_paid + attendance.fee_paid).toLocaleString()} F
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
