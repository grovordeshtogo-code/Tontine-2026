import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, Users, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '../lib/supabaseClient';

export const Layout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header Mobile */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary-900">Tontine Pro</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                            A
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Se déconnecter"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-20">
                <Outlet />
            </main>

            {/* Bottom Navigation (Mobile First) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center z-50 safe-area-bottom">
                <NavLink to="/" className={({ isActive }) => clsx("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600")} end>
                    <div className="p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </div>
                    <span className="text-[10px] font-medium">Accueil</span>
                </NavLink>
                <NavLink to="/dashboard" className={({ isActive }) => clsx("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600")}>
                    <LayoutDashboard size={24} />
                    <span className="text-[10px] font-medium">Tableau</span>
                </NavLink>
                <NavLink to="/checkin" className={({ isActive }) => clsx("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600")}>
                    <CheckSquare size={24} />
                    <span className="text-[10px] font-medium">Pointage</span>
                </NavLink>
                <NavLink to="/members" className={({ isActive }) => clsx("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600")}>
                    <Users size={24} />
                    <span className="text-[10px] font-medium">Membres</span>
                </NavLink>
                <NavLink to="/payouts" className={({ isActive }) => clsx("flex flex-col items-center gap-1 p-2 rounded-lg transition-colors", isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600")}>
                    <Calendar size={24} />
                    <span className="text-[10px] font-medium">Gains</span>
                </NavLink>
            </nav>
        </div>
    );
};
