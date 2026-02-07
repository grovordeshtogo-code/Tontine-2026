import { useState } from 'react';
import { useStore } from '../store/useStore';
import { calculateMemberStatus, simulatePaymentDistribution } from '../logic/calculations';
import { Check, Search, Calendar as CalendarIcon, AlertTriangle, ShieldCheck, Banknote, X, Percent, Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { exportToPDF, exportToWord, exportToExcel } from '../utils/exportUtils';
import clsx from 'clsx';
import type { Attendance } from '../types';

export const DailyCheckin: React.FC = () => {
    const { members, currentGroup, attendances, markAttendance, processBulkPayment, isLoading } = useStore();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkMemberId, setBulkMemberId] = useState<string | null>(null);
    const [bulkAmount, setBulkAmount] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Export State
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
    if (!currentGroup) return <div className="p-8 text-center text-gray-500">Aucun groupe actif.</div>;

    const filteredMembers = members.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
    );

    // Helper to get attendance for the SELECTED date
    const getAttendance = (memberId: string): Attendance | undefined => {
        return attendances.find(a => a.member_id === memberId && a.date === selectedDate);
    };

    const handleToggleAttendance = async (memberId: string, currentStatus: string | undefined, hasPenaltyPaid: boolean) => {
        // Toggle PAID status
        const NEW_STATUS = currentStatus === 'PAID' ? 'PENDING' : 'PAID';

        // COUPLED LOGIC: If marking as PAID, we force Fee to be PAID too.
        // If unmarking (PENDING), we force Fee to be UNPAID too.
        // This ensures 500F + 50F are paid together.
        const NEW_FEE_STATUS = NEW_STATUS === 'PAID';

        await markAttendance(memberId, selectedDate, NEW_STATUS, hasPenaltyPaid, NEW_FEE_STATUS);
    };

    const handleTogglePenalty = async (memberId: string, currentStatus: string | undefined, hasPenaltyPaid: boolean, hasFeePaid: boolean) => {
        const STATUS_TO_KEEP = (currentStatus || 'PENDING') as Attendance['status'];
        await markAttendance(memberId, selectedDate, STATUS_TO_KEEP, !hasPenaltyPaid, hasFeePaid);
    };

    const handleToggleFee = async (memberId: string, currentStatus: string | undefined, hasPenaltyPaid: boolean, hasFeePaid: boolean) => {
        const STATUS_TO_KEEP = (currentStatus || 'PENDING') as Attendance['status'];
        await markAttendance(memberId, selectedDate, STATUS_TO_KEEP, hasPenaltyPaid, !hasFeePaid);
    };

    const openBulkModal = (memberId: string) => {
        setBulkMemberId(memberId);
        setBulkAmount('');
        setShowBulkModal(true);
    };

    const confirmBulkPayment = async () => {
        if (!bulkMemberId || !bulkAmount) return;
        const amount = parseInt(bulkAmount);
        if (isNaN(amount) || amount <= 0) return;

        setIsProcessing(true);
        await processBulkPayment(bulkMemberId, amount);
        setIsProcessing(false);
        setShowBulkModal(false);
        setBulkMemberId(null);
    };

    const calculatedSessions = bulkAmount && currentGroup
        ? Math.floor(parseInt(bulkAmount) / currentGroup.contribution_amount)
        : 0;

    const simulation = (bulkMemberId && bulkAmount && currentGroup)
        ? simulatePaymentDistribution(
            bulkMemberId,
            parseInt(bulkAmount) || 0,
            currentGroup,
            attendances,
            members.find(m => m.id === bulkMemberId)?.wallet_balance || 0
        )
        : null;

    const handleExport = (type: 'pdf' | 'jpeg' | 'word' | 'excel') => {
        setIsExportMenuOpen(false);
        const title = `Pointage du ${new Date(selectedDate).toLocaleDateString('fr-FR')} - ${currentGroup?.name}`;

        const headers = ["Nom du Membre", "Statut", "Cotisation (500F)", "Pénalité", "Frais (50F)"];

        const data = filteredMembers.map(member => {
            const att = getAttendance(member.id);
            const isPresent = att?.status === 'PAID';
            const isPenaltyPaid = att?.penalty_paid;
            const isFeePaid = att?.fee_paid;

            return [
                member.full_name,
                isPresent ? "PRÉSENT" : "ABSENT",
                isPresent ? "PAYÉ" : "NON PAYÉ",
                isPenaltyPaid ? "PAYÉ" : "-",
                isFeePaid ? "PAYÉ" : "NON PAYÉ"
            ];
        });

        switch (type) {
            case 'pdf':
                exportToPDF(headers, data, title);
                break;
            case 'word':
                exportToWord(headers, data, title);
                break;
            case 'excel':
                exportToExcel(headers, data, title);
                break;
            // JPEG not implemented for this view as it scrolls
        }
    };

    return (
        <div className='pb-20 relative'>
            <div className="bg-white sticky top-0 z-10 pt-4 px-4 pb-2 shadow-sm border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Pointage</h2>
                    <div className="flex bg-gray-50 rounded-lg border border-gray-200 p-1">
                        <div className="flex items-center gap-2 px-2">
                            <CalendarIcon size={16} className="text-gray-500" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer outline-none w-28"
                            />
                        </div>
                    </div>

                    <div className="relative no-export ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExportMenuOpen(!isExportMenuOpen);
                            }}
                            className="bg-white p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        >
                            <Download size={20} />
                        </button>

                        {isExportMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="py-1">
                                    <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <FileType size={16} className="text-red-500" />
                                        PDF
                                    </button>
                                    <button onClick={() => handleExport('word')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <FileText size={16} className="text-blue-600" />
                                        Word
                                    </button>
                                    <button onClick={() => handleExport('excel')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <FileSpreadsheet size={16} className="text-green-600" />
                                        Excel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Chercher un nom..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 text-gray-900 pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:border-primary-500 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            <div className="p-4 space-y-3">
                {filteredMembers.map(member => {
                    const status = calculateMemberStatus(member, currentGroup, attendances.filter(a => a.member_id === member.id));
                    const attendanceToday = getAttendance(member.id);
                    const isPaid = attendanceToday?.status === 'PAID';
                    const isPenaltyPaid = (attendanceToday?.penalty_paid || 0) > 0;
                    const isFeePaid = (attendanceToday?.fee_paid || 0) > 0;

                    return (
                        <div key={member.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                    {member.photo_url ? (
                                        <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        member.full_name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        {status.balance < 0 ? (
                                            <span className="text-red-600 font-bold">
                                                Dette: {Math.abs(status.balance).toLocaleString()} {currentGroup.currency}
                                            </span>
                                        ) : (
                                            <span className="text-green-600 font-medium">
                                                À jour
                                            </span>
                                        )}
                                        {status.daysLate > 0 && (
                                            <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
                                                {status.daysLate}j Retard
                                            </span>
                                        )}
                                        {/* DETAILED DEBT BREAKDOWN */}
                                        {status.balance < 0 && (
                                            <div className="absolute top-10 left-16 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 text-xs w-64 hidden group-hover:block">
                                                <div className="font-bold mb-1 border-b pb-1">Détails de la dette</div>
                                                <div className="flex justify-between">
                                                    <span>{status.daysLate}j Retard:</span>
                                                    <span className="font-mono">{status.unpaidContributions.toLocaleString()} F</span>
                                                </div>
                                                <div className="flex justify-between text-red-500">
                                                    <span>Pénalités:</span>
                                                    <span className="font-mono">{status.unpaidPenalties.toLocaleString()} F</span>
                                                </div>
                                                <div className="flex justify-between font-bold border-t pt-1 mt-1">
                                                    <span>Total:</span>
                                                    <span className="font-mono">{Math.abs(status.balance).toLocaleString()} F</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Create a group container to handle hover state for detailed breakdown - BUT mobile? */}
                                    {/* Mobile friendly approach: Display it inline if space permits or always visible if debt exists */}
                                    {status.balance < 0 && (
                                        <div className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-x-2">
                                            <span>Retard: <b className="text-gray-700">{status.unpaidContributions.toLocaleString()} F</b></span>
                                            <span>Pénalité: <b className="text-red-500">{status.unpaidPenalties.toLocaleString()} F</b></span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Bulk Payment Trigger */}
                                <button
                                    onClick={() => openBulkModal(member.id)}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all border bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                                    title="Paiement groupé / Avance"
                                >
                                    <Banknote size={18} />
                                </button>

                                {/* Fee Toggle */}
                                {(currentGroup.admin_fee || 0) > 0 && (
                                    <button
                                        onClick={() => handleToggleFee(member.id, attendanceToday?.status, isPenaltyPaid, isFeePaid)}
                                        className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-all border",
                                            isFeePaid
                                                ? "bg-blue-100 text-blue-600 border-blue-200"
                                                : "bg-gray-50 text-gray-300 border-gray-100 hover:bg-gray-100"
                                        )}
                                        title="Payer les frais"
                                    >
                                        <Percent size={18} />
                                    </button>
                                )}

                                {/* Penalty Toggle */}
                                <button
                                    onClick={() => handleTogglePenalty(member.id, attendanceToday?.status, isPenaltyPaid, isFeePaid)}
                                    className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all boerder",
                                        isPenaltyPaid
                                            ? "bg-amber-100 text-amber-600 border-amber-200"
                                            : "bg-gray-50 text-gray-300 border-gray-100 hover:bg-gray-100"
                                    )}
                                    title="Payer une pénalité"
                                >
                                    {isPenaltyPaid ? <ShieldCheck size={20} /> : <AlertTriangle size={18} />}
                                </button>

                                {/* Contribution Toggle */}
                                <button
                                    onClick={() => handleToggleAttendance(member.id, attendanceToday?.status, isPenaltyPaid)}
                                    className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center transition-all border",
                                        isPaid
                                            ? "bg-green-100 text-green-600 border-green-200"
                                            : "bg-gray-50 text-gray-300 border-gray-100 hover:bg-gray-100"
                                    )}
                                    title="Payer la cotisation"
                                >
                                    {isPaid ? <Check size={20} /> : <div className="w-3 h-3 rounded-full bg-gray-300" />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bulk Payment Modal */}
            {
                showBulkModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Paiement Avancé</h3>
                                <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Montant total versé
                                </label>
                                <input
                                    type="number"
                                    value={bulkAmount}
                                    onChange={(e) => setBulkAmount(e.target.value)}
                                    className="w-full text-2xl font-bold p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="ex: 50000"
                                    autoFocus
                                />
                                {calculatedSessions > 0 || (simulation && simulation.totalCovered > 0) ? (
                                    <div className={clsx(
                                        "mt-3 p-3 rounded-lg text-sm flex items-start gap-2",
                                        simulation && simulation.remainingAmount > 0 ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-blue-50 text-blue-700"
                                    )}>
                                        {simulation && simulation.remainingAmount > 0 ? <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" /> : <Check size={16} className="mt-0.5 flex-shrink-0" />}
                                        <div className="flex-1">
                                            <p className="font-bold">
                                                Couverture: {simulation ? simulation.totalCovered : calculatedSessions} jours
                                            </p>

                                            {simulation && (
                                                <>
                                                    <ul className="text-xs mt-1 space-y-1 opacity-90">
                                                        {simulation.breakdown.penalties > 0 && (
                                                            <li className={simulation.remainingAmount > 0 ? "text-amber-800" : "text-orange-700"}>
                                                                • {simulation.breakdown.penalties} Pénalités incluses
                                                            </li>
                                                        )}
                                                        {simulation.breakdown.fees > 0 && (
                                                            <li className={simulation.remainingAmount > 0 ? "text-amber-800" : "text-blue-700"}>
                                                                • {simulation.breakdown.fees} Frais admin inclus
                                                            </li>
                                                        )}
                                                        <li>
                                                            • {simulation.breakdown.contributions} Cotisations
                                                        </li>
                                                    </ul>

                                                    {simulation.remainingAmount > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-blue-200">
                                                            <p className="font-bold text-xs text-green-600 mb-1">
                                                                Surplus: {simulation.remainingAmount} {currentGroup.currency}
                                                            </p>
                                                            <p className="text-xs opacity-80 text-gray-600">
                                                                Ce montant sera ajouté à votre portefeuille.
                                                            </p>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {(!simulation || simulation.remainingAmount === 0) && (
                                                <div className="mt-2 text-xs opacity-70">
                                                    Dates: partir du {new Date(selectedDate).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    bulkAmount && (
                                        <div className="mt-3 p-2 text-xs text-orange-600 bg-orange-50 rounded">
                                            Montant insuffisant pour couvrir une journée complète.
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowBulkModal(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmBulkPayment}
                                    disabled={!simulation || isProcessing}
                                    className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                                >
                                    {isProcessing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Valider'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
