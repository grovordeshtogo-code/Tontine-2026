import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (à adapter selon votre .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTestMembers() {
    console.log('🔍 Récupération des membres pour les tests...\n');

    const { data: members, error } = await supabase
        .from('members')
        .select(`
            id,
            full_name,
            pin_code,
            group_id,
            status,
            phone
        `)
        .eq('status', 'ACTIVE')
        .limit(10);

    if (error) {
        console.error('❌ Erreur:', error);
        return;
    }

    if (!members || members.length === 0) {
        console.log('⚠️  Aucun membre trouvé dans la base de données.');
        console.log('\nPour créer un membre de test, utilisez l\'interface admin:');
        console.log('1. Allez sur http://localhost:5173');
        console.log('2. Connectez-vous en tant qu\'admin');
        console.log('3. Créez un nouveau membre avec un code PIN');
        return;
    }

    console.log(`✅ ${members.length} membre(s) trouvé(s):\n`);
    console.log('═══════════════════════════════════════════════════════════');

    for (const member of members) {
        // Récupérer le nombre de cotisations
        const { data: attendances } = await supabase
            .from('attendance')
            .select('id')
            .eq('member_id', member.id);

        // Récupérer le groupe
        const { data: group } = await supabase
            .from('groups')
            .select('name')
            .eq('id', member.group_id)
            .single();

        console.log(`\n👤 Nom: ${member.full_name}`);
        console.log(`   📱 Téléphone: ${member.phone || 'N/A'}`);
        console.log(`   🔑 Code PIN: ${member.pin_code}`);
        console.log(`   🏢 Groupe: ${group?.name || 'N/A'}`);
        console.log(`   📊 Cotisations: ${attendances?.length || 0}`);
        console.log('───────────────────────────────────────────────────────────');
    }

    console.log('\n\n📋 INSTRUCTIONS DE TEST:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('1. Ouvrez: http://localhost:5173/member-login');
    console.log('2. Utilisez les identifiants ci-dessus');
    console.log('3. Vérifiez que le dashboard affiche les données\n');
}

getTestMembers();
