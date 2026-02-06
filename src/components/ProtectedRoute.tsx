import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<boolean | null>(null); // null = loading
    const location = useLocation();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(!!session);
        });

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (session === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 size={32} className="text-primary-600 animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Vérification de l'accès...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        // Redirect to login page, but save the tried location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
