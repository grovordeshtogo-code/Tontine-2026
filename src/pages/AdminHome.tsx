import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, Calendar, Shield, Lock, Unlock, ChevronRight, PlusCircle, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { GroupLoginModal } from '../components/GroupLoginModal';
import { GroupModal } from '../components/GroupModal';
import clsx from 'clsx';
import type { Group } from '../types';

export const AdminHome: React.FC = () => {
    const { groups, currentGroup, unlockedGroupIds, fetchData, addGroup, updateGroup, deleteGroup } = useStore();
    const [loginGroupId, setLoginGroupId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);

    // Détermine si un groupe est actif et déverrouillé
    const isGroupAccessible = currentGroup && (
        !currentGroup.password || unlockedGroupIds.includes(currentGroup.id)
    );

    const handleGroupClick = async (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        if (group) {
            // Si c'est déjà le groupe courant et qu'il est accessible, on ne fait rien
            if (currentGroup?.id === groupId && unlockedGroupIds.includes(groupId)) return;

            if (group.password && !unlockedGroupIds.includes(groupId)) {
                setLoginGroupId(groupId);
            } else {
                await fetchData(groupId);
            }
        }
    };

    const handleUnlockSuccess = () => {
        if (loginGroupId) {
            fetchData(loginGroupId);
            setLoginGroupId(null);
        }
    };

    const handleSaveGroup = async (name: string, amount: number, rotation: number, start: string, password?: string, penalty?: number, adminFee?: number) => {
        if (editingGroup) {
            await updateGroup(editingGroup.id, {
                name,
                contribution_amount: amount,
                rotation_days: rotation,
                start_date: start,
                penalty_per_day: penalty,
                admin_fee: adminFee,
                password
            });
        } else {
            await addGroup(name, amount, rotation, start, password, penalty, adminFee);
        }
        setIsCreateModalOpen(false);
        setEditingGroup(undefined);
    };

    const handleEditGroup = (e: React.MouseEvent, group: Group) => {
        e.stopPropagation();
        setEditingGroup(group);
        setIsCreateModalOpen(true);
    };

    const handleDeleteGroup = async (e: React.MouseEvent, group: Group) => {
        e.stopPropagation();
        if (window.confirm(`Voulez-vous vraiment supprimer le groupe "${group.name}" ? Cette action est irréversible et supprimera toutes les données associées.`)) {
            await deleteGroup(group.id);
        }
    };

    const handleCreateClick = () => {
        setEditingGroup(undefined);
        setIsCreateModalOpen(true);
    };

    const shortcuts = [
        {
            title: 'Tableau de Bord',
            description: 'Vue d\'ensemble des cotisations et statistiques.',
            icon: <LayoutDashboard size={32} />,
            to: '/dashboard',
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Gestion Membres',
            description: 'Ajouter, modifier ou contacter les membres.',
            icon: <Users size={32} />,
            to: '/members',
            color: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50'
        },
        {
            title: 'Pointage Journalier',
            description: 'Valider les présences et cotisations du jour.',
            icon: <CheckSquare size={32} />,
            to: '/checkin',
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Calendrier Gains',
            description: 'Suivre les distributions et tours de gains.',
            icon: <Calendar size={32} />,
            to: '/payouts',
            color: 'bg-amber-500',
            textColor: 'text-amber-600',
            bgColor: 'bg-amber-50'
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in pb-20">
            {/* Header Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center shrink-0">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">Espace Administration</h1>
                        <p className="text-gray-500 mt-1">Gérez vos tontines en toute simplicité.</p>
                    </div>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:bg-primary-700 transition transform hover:scale-105 active:scale-95 w-full md:w-auto justify-center"
                >
                    <PlusCircle size={20} />
                    <span>Créer une Tontine</span>
                </button>
            </div>

            {/* Groups List */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-800 px-1">Vos Tontines</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map(group => {
                        const isLocked = group.password && !unlockedGroupIds.includes(group.id);
                        const isActive = currentGroup?.id === group.id;

                        return (
                            <div
                                key={group.id}
                                onClick={() => handleGroupClick(group.id)}
                                className={clsx(
                                    "group p-6 rounded-2xl shadow-sm border transition-all cursor-pointer relative overflow-hidden flex flex-col gap-4",
                                    isActive
                                        ? "bg-primary-50 border-primary-200 ring-2 ring-primary-500 ring-offset-2"
                                        : "bg-white border-gray-100 hover:shadow-md hover:border-gray-200"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="relative z-10">
                                        <h3 className={clsx("text-lg font-bold flex items-center gap-2", isActive ? "text-primary-900" : "text-gray-900")}>
                                            {group.name}
                                            {isLocked && <Lock size={16} className="text-orange-500" />}
                                            {!isLocked && group.password && <Unlock size={16} className="text-green-500" />}
                                        </h3>
                                        <p className={clsx("text-sm mt-1", isActive ? "text-primary-600" : "text-gray-500")}>
                                            {group.contribution_amount.toLocaleString()} {group.currency} / tour
                                        </p>
                                    </div>
                                    <div className={clsx(
                                        "p-2 rounded-full transition-colors",
                                        isActive ? "bg-primary-100 text-primary-600" : isLocked ? "bg-orange-50 text-orange-500" : "bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600"
                                    )}>
                                        {isActive ? <CheckCircle2 size={24} /> : <ChevronRight size={20} />}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2 border-t pt-3 border-gray-100 z-20">
                                    <button
                                        onClick={(e) => handleEditGroup(e, group)}
                                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="Modifier"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteGroup(e, group)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {groups.length === 0 && (
                        <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                <PlusCircle size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Aucune tontine pour le moment</h3>
                            <p className="text-gray-500 mt-1 max-w-sm">Commencez par créer votre première tontine en cliquant sur le bouton ci-dessus.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Active Group Menu (Visible only if a group is selected and unlocked) */}
            {isGroupAccessible && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className="flex items-center justify-between px-1 border-t border-gray-100 pt-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Menu Principal</h2>
                            <p className="text-sm text-gray-500">Gérez la tontine <span className="font-bold text-primary-600">{currentGroup?.name}</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {shortcuts.map((item, index) => (
                            <Link
                                key={index}
                                to={item.to}
                                className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-start gap-4"
                            >
                                <div className={`p-4 rounded-xl ${item.bgColor} ${item.textColor} group-hover:scale-110 transition-transform`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <GroupLoginModal
                isOpen={!!loginGroupId}
                groupId={loginGroupId}
                onClose={() => setLoginGroupId(null)}
                onSuccess={handleUnlockSuccess}
            />

            <GroupModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveGroup}
                initialData={editingGroup}
            />
        </div>
    );
};
