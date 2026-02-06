import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck, User } from 'lucide-react';
import { useStore } from '../store/useStore';

type LoginType = 'admin' | 'member';

export const Login: React.FC = () => {
    const [loginType, setLoginType] = useState<LoginType>('member'); // Default to member for easier access

    // Admin State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Member State
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const { loginMember } = useStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (loginType === 'admin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                navigate('/');
            } else {
                const success = await loginMember(name, pin);
                if (success) {
                    navigate('/member-dashboard');
                } else {
                    throw new Error('Identifiants incorrects. Vérifiez votre nom et code PIN.');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Erreur lors de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decoration */}
            <div className={`absolute top-0 left-0 w-full h-64 transform -skew-y-6 origin-top-left -translate-y-12 z-0 transition-colors duration-500 ${loginType === 'admin' ? 'bg-red-700' : 'bg-emerald-600'}`}></div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
                    <button
                        onClick={() => { setLoginType('member'); setError(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${loginType === 'member' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ShieldCheck size={18} />
                        Espace Membre
                    </button>
                    <button
                        onClick={() => { setLoginType('admin'); setError(null); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${loginType === 'admin' ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Lock size={18} />
                        Administrateur
                    </button>
                </div>

                <div className="text-center">
                    <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${loginType === 'admin' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        {loginType === 'admin' ? <Lock size={32} /> : <User size={32} />}
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        {loginType === 'admin' ? 'Administration' : 'Connexion Membre'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {loginType === 'admin' ? 'Accès réservé aux gestionnaires' : 'Consultez vos cotisations'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        {loginType === 'admin' ? (
                            <>
                                {/* Admin Fields */}
                                <div className="relative">
                                    <label htmlFor="email" className="sr-only">Email</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                        placeholder="Email administrateur"
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="password" className="sr-only">Mot de passe</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm transition-all"
                                        placeholder="Mot de passe"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Member Fields */}
                                <div className="relative">
                                    <label htmlFor="name" className="sr-only">Nom complet</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <User size={20} />
                                    </div>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
                                        placeholder="Votre nom complet"
                                    />
                                </div>
                                <div className="relative">
                                    <label htmlFor="pin" className="sr-only">Code PIN</label>
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        id="pin"
                                        name="pin"
                                        type="password"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        required
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all tracking-widest text-center font-mono text-lg"
                                        placeholder="Code PIN (4 chiffres)"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 flex items-center gap-2 text-red-700 text-sm animate-pulse">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg ${loginType === 'admin' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/30' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-emerald-500/30'}`}
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {loginType === 'admin' ? 'Se connecter' : 'Accéder à mon espace'}
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Registration Link REMOVED */}
                </form>
            </div>

            <div className="absolute bottom-4 text-center text-xs text-gray-400 z-10 w-full">
                &copy; 2026 Grovordesh Tontine Manager. Tous droits réservés.
            </div>
        </div>
    );
};
