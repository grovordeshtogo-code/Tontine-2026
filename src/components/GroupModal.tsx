import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Group } from '../types';

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, amount: number, rotation: number, start: string, password?: string, penalty?: number, adminFee?: number) => void;
    initialData?: Group;
}

export const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [penalty, setPenalty] = useState('200');
    const [rotation, setRotation] = useState('7'); // Default weekly
    const [adminFee, setAdminFee] = useState('0');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name);
            setAmount(initialData.contribution_amount.toString());
            setPenalty(initialData.penalty_per_day.toString());
            setRotation(initialData.rotation_days.toString());
            setAdminFee((initialData.admin_fee || 0).toString());
            setStartDate(initialData.start_date);
            setPassword(initialData.password || '');
        } else if (isOpen) {
            // Only reset when opening in 'create' mode
            setName('');
            setAmount('');
            setPenalty('200');
            setRotation('7');
            setAdminFee('0');
            setStartDate(new Date().toISOString().split('T')[0]);
            setPassword('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name, parseInt(amount), parseInt(rotation), startDate, password, parseInt(penalty), parseInt(adminFee));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                        {initialData ? 'Modifier la Tontine' : 'Nouvelle Tontine'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Groupe</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Ex: Tontine Famille"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Montant / Tour</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    placeholder="5000"
                                    min="100"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">F</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pénalité / Jour</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    value={penalty}
                                    onChange={(e) => setPenalty(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    placeholder="200"
                                    min="0"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">F</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rotation (Jours)</label>
                            <input
                                type="number"
                                required
                                value={rotation}
                                onChange={(e) => setRotation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bénéfice Admin / Jour</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={adminFee}
                                    onChange={(e) => setAdminFee(e.target.value)}
                                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                                    placeholder="0"
                                    min="0"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">F</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Début</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe (Optionnel)</label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Laisser vide pour accès libre"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition"
                        >
                            {initialData ? 'Enregistrer les modifications' : 'Créer la Tontine'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
