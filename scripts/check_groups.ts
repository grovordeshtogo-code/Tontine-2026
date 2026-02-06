
import { createClient } from '@supabase/supabase-js';

const url = 'https://kprksptqgydtzyeqdyvk.supabase.co';
const key = 'sb_publishable_n1dWL2LCsKBnZjzKqxEECA_t_GnJqGC';
const supabase = createClient(url, key);

async function main() {
    console.log("Checking groups...");
    const { data, error } = await supabase.from('groups').select('*');

    if (error) {
        console.error("Error fetching groups:", JSON.stringify(error, null, 2));
    } else {
        console.log("Groups found:", data?.length);
        data?.forEach(g => console.log(`- ${g.name} (ID: ${g.id})`));

        const target = data?.find(g => g.name === 'Tontine 3001');
        if (target) {
            console.log("SUCCESS: Tontine 3001 exists.");
        } else {
            console.log("TARGET MISSING: Tontine 3001 not found.");
        }
    }
}

main();
