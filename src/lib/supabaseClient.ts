import { createClient } from '@supabase/supabase-js';

// En attendant les vraies clés, on utilise des placeholders.
// L'application doit gérer l'absence de connexion ou utiliser un mode mock.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
