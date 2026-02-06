import fs from 'fs';

const firstNames = ['Amadou', 'Mamadou', 'Fatou', 'Aminata', 'Moussa', 'Oumar', 'Seydou', 'Awa', 'Mariam', 'Ibrahim', 'Youssouf', 'Abdoulaye', 'Kadiatou', 'Fanta', 'Sékou', 'Jean', 'Paul', 'Marie', 'Luc', 'Sophie'];
const lastNames = ['Diallo', 'Sow', 'Barry', 'Bah', 'Camara', 'Traoré', 'Cissé', 'Keïta', 'Diop', 'Ndiaye', 'Fall', 'Wade', 'Mbodj', 'Sy', 'Gueye', 'Koné', 'Touré', 'Coulibaly', 'Diarra', 'Sako'];

function generatePhone() {
    return '6' + Math.floor(Math.random() * 90000000 + 10000000).toString();
}

let csvContent = "full_name,phone,status,join_date,group_id\n";

// ID Placeholder - L'utilisateur devra le remplacer ou le mappage se fera à l'import si colonne ignorée
const GROUP_ID_PLACEHOLDER = "REMPLACER_PAR_VOTRE_GROUP_ID";

for (let i = 0; i < 100; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const phone = generatePhone();
    const status = 'ACTIVE';
    const joinDate = new Date().toISOString().split('T')[0];

    csvContent += `"${fullName}","${phone}","${status}","${joinDate}","${GROUP_ID_PLACEHOLDER}"\n`;
}

fs.writeFileSync('members_100.csv', csvContent);
console.log('CSV généré : members_100.csv');
