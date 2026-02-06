import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const RequireGroup: React.FC = () => {
    const { currentGroup, unlockedGroupIds } = useStore();

    // Condition d'accès:
    // 1. Un groupe doit être sélectionné (currentGroup !== null)
    // 2. Si le groupe a un password, il doit être dans unlockedGroupIds

    // Si pas de groupe -> Redirection Accueil
    if (!currentGroup) {
        return <Navigate to="/" replace />;
    }

    // Si groupe protégé mais pas déverrouillé -> Redirection Accueil pour afficher le login modal
    // (Note: AdminHome gère l'affichage du modal si on clique dessus)
    if (currentGroup.password && !unlockedGroupIds.includes(currentGroup.id)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
