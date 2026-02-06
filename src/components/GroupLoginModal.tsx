import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

interface GroupLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groupId: string | null;
}

export const GroupLoginModal: React.FC<GroupLoginModalProps> = ({ isOpen, onClose, onSuccess, groupId }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const unlockGroup = useStore(state => state.unlockGroup);
    const groups = useStore(state => state.groups);

    if (!isOpen || !groupId) return null;

    const group = groups.find(g => g.id === groupId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await unlockGroup(groupId, password);
            if (success) {
                onSuccess();
                setPassword('');
                onClose();
            } else {
                setError('Mot de passe incorrect');
            }
        } catch (err) {
            console.error("Erreur unlock:", err);
            setError('Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-800">
                        <Lock size={20} className="text-primary-600" />
                        <h3 className="font-bold text-lg">Accès Protégé</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-600 mb-6 text-sm">
                        Le groupe <strong className="text-gray-900">{group?.name}</strong> est protégé par un mot de passe.
                        Veuillez l'entrer pour accéder aux données.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe du groupe
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                                placeholder="Entrez le mot de passe..."
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1">{error}</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition mr-2"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !password}
                                className={clsx(
                                    "px-6 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-lg shadow-primary-500/30 transition transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:transform-none",
                                    isLoading && "cursor-wait"
                                )}
                            >
                                {isLoading ? 'Vérification...' : 'Accéder'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
