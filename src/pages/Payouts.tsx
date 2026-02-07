import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Calendar, CheckCircle, Download, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { exportToPDF, exportToWord, exportToExcel } from '../utils/exportUtils';
import clsx from 'clsx';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Payouts: React.FC = () => {
    const { pots, currentGroup, members, generatePayouts, validatePayout, isLoading } = useStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    if (isLoading) return <div className="p-8 text-center text-gray-400">Chargement...</div>;
    if (!currentGroup) return <div className="p-8 text-center text-gray-500">Aucun groupe actif.</div>;

    const handleGenerate = async () => {
        setIsGenerating(true);
        // On génère pour le montant de la cagnotte définie
        await generatePayouts(
            currentGroup.id,
            members,
            currentGroup.start_date,
            currentGroup.rotation_days
        );
        setIsGenerating(false);
    };

    const handleExport = (type: 'pdf' | 'word' | 'excel') => {
        setIsExportMenuOpen(false);
        const title = `Calendrier des Gains - ${currentGroup?.name}`;

        const headers = ["Ordre", "Date", "Membre", "Montant", "Statut"];

        const data = pots.map((pot, index) => {
            const member = members.find(m => m.id === pot.member_id);
            const date = parseISO(pot.distribution_date);
            const isDone = pot.status === 'COMPLETED';

            return [
                `#${index + 1}`,
                format(date, "d MMMM yyyy", { locale: fr }),
                member?.full_name || 'Inconnu',
                (pot.amount || 0).toLocaleString('fr-FR') + ' F',
                isDone ? "VERSÉ" : "EN ATTENTE"
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
        }
    };

    return (
        <div className="pb-20">
            <div className="bg-white sticky top-0 z-10 p-4 border-b border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Calendrier des Gains</h2>
                    <p className="text-xs text-gray-500">Prochain gain chaque {currentGroup.rotation_days} jours</p>
                </div>

                <div className="flex gap-2">
                    {pots.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="p-2 bg-white text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary-600 transition-colors"
                                title="Exporter le calendrier"
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
                    )}

                    {pots.length === 0 && (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                        >
                            {isGenerating ? 'Calcul...' : 'Générer Planning'}
                        </button>
                    )}
                </div>
            </div>

            <div className="p-4 space-y-4">
                {pots.length === 0 ? (
                    <div className="text-center py-10 flex flex-col items-center">
                        <Calendar size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-500">Aucun calendrier défini pour cette tontine.</p>
                        <p className="text-sm text-gray-400 mt-1">Cliquez sur "Générer" pour créer l'ordre de passage basé sur la liste des membres.</p>
                    </div>
                ) : (
                    pots.map((pot, index) => {
                        const member = members.find(m => m.id === pot.member_id);
                        const date = parseISO(pot.distribution_date);
                        const isDone = pot.status === 'COMPLETED';
                        const isLate = !isDone && isPast(date) && !isToday(date);
                        const isNow = isToday(date);

                        return (
                            <div key={pot.id} className={clsx(
                                "rounded-xl p-4 border relative overflow-hidden transition-all",
                                isDone ? "bg-green-50 border-green-100" : "bg-white border-gray-100 shadow-sm",
                                isLate && "border-orange-200 bg-orange-50"
                            )}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-bold">
                                            #{index + 1}
                                        </div>
                                        <span className={clsx("text-sm font-medium", isDone ? "text-green-700" : "text-gray-500")}>
                                            {format(date, "d MMMM yyyy", { locale: fr })}
                                        </span>
                                        {isNow && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">AUJOURD'HUI</span>}
                                        {isLate && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold">EN ATTENTE</span>}
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {(pot.amount || 0).toLocaleString()} {currentGroup.currency}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                                            isDone ? "bg-green-200 text-green-700" : "bg-gray-100 text-gray-500"
                                        )}>
                                            {(member?.full_name || '?').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{member?.full_name || 'Membre inconnu'}</div>
                                            <div className="text-xs text-gray-500">{member?.phone}</div>
                                        </div>
                                    </div>

                                    {!isDone && (
                                        <button
                                            onClick={() => validatePayout(pot.id)}
                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-green-700 flex items-center gap-1"
                                        >
                                            <CheckCircle size={14} />
                                            Valider
                                        </button>
                                    )}
                                    {isDone && (
                                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                            <CheckCircle size={16} />
                                            Versé
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
