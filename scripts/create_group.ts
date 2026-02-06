
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load env manually since we are outside of Vite context usually
// Assuming .env or similar exists. But I can also just inspect the lib/supabaseClient file to get URL/KEY if needed.
// Let's first try to read supabaseClient.ts to grap credentials if .env fails or isn't standard.
// Actually, in a Vite project, env vars are VITE_... 
// I'll assume I can just import the client if I use tsx, BUT client uses import.meta.env which fails in Node.
// So I need to read .env file manually.

async function main() {
    // 1. Read .env.local or .env
    // Hardcoded credentials from .env for immediate execution
    const url = 'https://kprksptqgydtzyeqdyvk.supabase.co';
    const key = 'sb_publishable_n1dWL2LCsKBnZjzKqxEECA_t_GnJqGC';

    const supabase = createClient(url, key);

    console.log("Creating group 'Tontine 3001'...");

    const { data, error } = await supabase.from('groups').insert({
        name: 'Tontine 3001',
        contribution_amount: 5000,
        pot_amount: 0,
        rotation_days: 7,
        start_date: new Date().toISOString().split('T')[0],
        password: '3001',
        currency: 'FCFA',
        penalty_per_day: 200
    }).select().single();

    if (error) {
        console.error("Error creating group:", error);
    } else {
        console.log("Group created successfully:", data);
        console.log("ID:", data.id);
    }
}

main();
