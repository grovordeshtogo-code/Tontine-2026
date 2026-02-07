import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { calculateDailyTotals } from '../logic/calculations';
import { TrendingUp, ArrowLeft, Download, FileText, Image, FileSpreadsheet, FileType } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exportToPDF, exportToJPEG, exportToWord, exportToExcel } from '../utils/exportUtils';


export const DailySummary: React.FC = () => {
    const { attendances, currentGroup } = useStore();
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const dailyTotals = useMemo(() => {
        const data = calculateDailyTotals(attendances);
        // Sort chronologically (ascending: Oldest first)
        return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [attendances]);

    if (!currentGroup) return <div className="p-8 text-center">Aucun groupe sélectionné</div>;

    const handleExport = (type: 'pdf' | 'jpeg' | 'word' | 'excel') => {
        setIsExportMenuOpen(false);

        const title = `Récapitulatif - ${currentGroup.name}`;

        // Define Headers
        const headers = ["Date", "Cotisations", "Pénalités", "Frais", "Total"];

        // Format Data Rows
        const data = dailyTotals.map(d => [
            new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
            (d.totalContributions).toLocaleString('fr-FR') + ' F',
            (d.totalPenalties).toLocaleString('fr-FR') + ' F',
            (d.totalFees).toLocaleString('fr-FR') + ' F',
            (d.totalContributions + d.totalPenalties + d.totalFees).toLocaleString('fr-FR') + ' F'
        ]);

        switch (type) {
            case 'pdf':
                exportToPDF(headers, data, title);
                break;
            case 'jpeg':
                exportToJPEG('daily-summary-table', title);
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
        <div className="space-y-6 pb-20" onClick={() => setIsExportMenuOpen(false)}>
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link to="/dashboard" className="p-2 bg-white rounded-full text-gray-500 hover:text-gray-900 shadow-sm border border-gray-100">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Récapitulatif Journalier</h2>
                    <p className="text-gray-500 text-sm">Historique des entrées par jour</p>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" id="daily-summary-table">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center relative">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary-600" />
                        Transactions
                    </h3>

                    <div className="relative no-export">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExportMenuOpen(!isExportMenuOpen);
                            }}
                            className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                        >
                            <Download size={14} />
                            Exporter
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
                                    <div className="h-px bg-gray-100 my-1" />
                                    <button onClick={() => handleExport('jpeg')} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                        <Image size={16} className="text-purple-500" />
                                        Image (JPEG)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {dailyTotals.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        Aucune donnée disponible.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Cotisations</th>
                                    <th className="px-4 py-3 text-right">Pénalités</th>
                                    <th className="px-4 py-3 text-right">Frais</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {dailyTotals.map((day) => {
                                    const totalDay = day.totalContributions + day.totalPenalties + day.totalFees;
                                    return (
                                        <tr key={day.date} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {new Date(day.date).toLocaleDateString('fr-FR', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-3 text-right text-green-600">
                                                {day.totalContributions > 0 ? `${day.totalContributions.toLocaleString()} F` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-500">
                                                {day.totalPenalties > 0 ? `${day.totalPenalties.toLocaleString()} F` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500">
                                                {day.totalFees > 0 ? `${day.totalFees.toLocaleString()} F` : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">
                                                {totalDay.toLocaleString()} F
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
