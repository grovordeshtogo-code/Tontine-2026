import React, { useState } from 'react';
// Force UI Update
import { useStore } from '../store/useStore';
import { Search, Phone, MessageSquare, Layers, Pencil, Trash2, Undo, Archive, UserX } from 'lucide-react';
import { calculateMemberStatus } from '../logic/calculations';
import clsx from 'clsx';
import { MemberModal } from '../components/MemberModal';
import type { Member } from '../types';

export const Members: React.FC = () => {
    const { members, currentGroup, groups, attendances, updateMember, deleteMember, addMember, isLoading } = useStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
    if (!currentGroup) return <div className="p-8 text-center text-gray-500">Aucun groupe actif. Veuillez en sélectionner un depuis l'accueil.</div>;

    // Filter members based on archive status AND search term
    const filteredMembers = members.filter(member => {
        const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || member.phone.includes(searchTerm);
        const matchesArchive = showArchived ? member.status === 'ARCHIVED' : member.status !== 'ARCHIVED';
        return matchesSearch && matchesArchive;
    });

    const getGroupName = (groupId: string) => {
        const group = groups.find(g => g.id === groupId);
        return group ? group.name : 'Groupe Inconnu';
    };

    const handleWhatsApp = (member: typeof members[0]) => {
        const memberGroup = groups.find(g => g.id === member.group_id);
        if (!memberGroup) return;

        const status = calculateMemberStatus(member, memberGroup, attendances.filter(a => a.member_id === member.id));

        // Format Phone Number
        let phone = member.phone.replace(/[^0-9]/g, '');
        // Heuristic: If 8 digits, likely Togo without prefix. Prepend 228.
        if (phone.length === 8) {
            phone = '228' + phone;
        }

        let message = '';

        if (status.balance < 0) {
            // Debt Message
            const debt = Math.abs(status.balance);
            const lateDays = status.daysLate;
            const penaltyPart = lateDays * memberGroup.penalty_per_day;

            message = `Bonjour ${member.full_name}, sauf erreur de notre part, vous avez ${lateDays} jours de retard pour la tontine "${memberGroup.name}".\n` +
                `Montant total dû: ${debt.toLocaleString()} ${memberGroup.currency} \n` +
                `(Dont ${penaltyPart}F de pénalités).\nMerci de régulariser au plus vite.`;
        } else {
            // Generic Message (Up to date)
            message = `Bonjour ${member.full_name}, ceci est un message de la tontine "${memberGroup.name}".\n` +
                `Votre compte est à jour. Merci pour votre régularité !`;

            if (!window.confirm(`Ce membre est à jour. Voulez-vous envoyer un message de félicitations ?`)) {
                return;
            }
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);

    const handleOpenAdd = () => {
        setEditingMember(undefined);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (member: Member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSaveMember = async (name: string, phone: string, pin: string) => {
        if (editingMember) {
            await updateMember(editingMember.id, { full_name: name, phone, pin_code: pin });
        } else if (currentGroup) {
            await addMember(currentGroup.id, name, phone, pin);
        }
        setIsModalOpen(false);
    };

    // Soft Delete / Archive
    const handleArchiveMember = async (member: Member) => {
        if (window.confirm(`Voulez-vous déplacer "${member.full_name}" vers la corbeille ?`)) {
            await updateMember(member.id, { status: 'ARCHIVED' });
        }
    };

    // Restore
    const handleRestoreMember = async (member: Member) => {
        await updateMember(member.id, { status: 'ACTIVE' });
    };

    // Hard Delete
    const handleHardDelete = async (member: Member) => {
        if (window.confirm(`ATTENTION: Voulez-vous supprimer définitivement "${member.full_name}" ? Cette action est irréversible.`)) {
            await deleteMember(member.id);
        }
    };

    return (
        <div className="pb-20">
            <div className="bg-white sticky top-0 z-10 p-4 border-b border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">
                        {showArchived ? 'Corbeille' : `Répertoire (${filteredMembers.length})`}
                    </h2>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowArchived(!showArchived)}
                            className={clsx(
                                "p-2 rounded-lg transition-colors border",
                                showArchived
                                    ? "bg-gray-200 text-gray-800 border-gray-300"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                            )}
                            title={showArchived ? "Voir les membres actifs" : "Voir la corbeille"}
                        >
                            {showArchived ? <Undo size={20} /> : <Trash2 size={20} />}
                        </button>

                        {!showArchived && (
                            <button
                                onClick={handleOpenAdd}
                                className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary-700 transition-colors"
                            >
                                + Ajouter
                            </button>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder={showArchived ? "Chercher dans la corbeille..." : "Rechercher un membre..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 text-gray-900 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="p-4 space-y-3">
                {filteredMembers.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
                        {showArchived ? <Archive size={48} className="opacity-20" /> : <UserX size={48} className="opacity-20" />}
                        <p>Aucun membre trouvé {showArchived ? 'dans la corbeille' : ''}</p>
                    </div>
                ) : (
                    filteredMembers.map(member => {
                        const memberGroup = groups.find(g => g.id === member.group_id);
                        const memberStatus = memberGroup ? calculateMemberStatus(member, memberGroup, attendances.filter(a => a.member_id === member.id)) : null;

                        return (
                            <div key={member.id} className={clsx(
                                "rounded-xl p-4 shadow-sm border flex items-center justify-between transition-colors",
                                showArchived ? "bg-gray-50 border-gray-200 opacity-75" : "bg-white border-gray-100"
                            )}>
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className={clsx(
                                        "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2",
                                        member.status === 'ACTIVE' ? "bg-primary-50 text-primary-600 border-primary-100" :
                                            member.status === 'ALERT_8J' ? "bg-orange-50 text-orange-600 border-orange-100" :
                                                "bg-gray-100 text-gray-400 border-gray-200"
                                    )}>
                                        {member.photo_url ? (
                                            <img src={member.photo_url} alt={member.full_name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            member.full_name.charAt(0)
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{member.full_name}</h3>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Phone size={14} />
                                                <span>{member.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-primary-600 font-medium">
                                                <Layers size={14} />
                                                <span>{getGroupName(member.group_id)}</span>
                                            </div>
                                        </div>

                                        {!showArchived && memberStatus && memberStatus.daysLate > 0 && (
                                            <div className="text-xs text-red-600 font-medium mt-1">
                                                Retard: {memberStatus.daysLate}j (-{Math.abs(memberStatus.balance).toLocaleString()}F)
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    {/* Action Buttons */}
                                    {showArchived ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestoreMember(member)}
                                                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100"
                                                title="Restaurer"
                                            >
                                                <Undo size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleHardDelete(member)}
                                                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100"
                                                title="Supprimer définitivement"
                                            >
                                                <UserX size={18} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(member)}
                                                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                                                title="Modifier"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleWhatsApp(member)}
                                                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                                                title="WhatsApp"
                                            >
                                                <MessageSquare size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleArchiveMember(member)}
                                                className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Mettre à la corbeille"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <MemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMember}
                initialData={editingMember}
            />
        </div>
    );
};
