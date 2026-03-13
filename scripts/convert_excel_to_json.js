const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const caregiverFile = 'c:/Users/Albino/Downloads/50_caregiver_fittizi.xlsx';
const disabledFile = 'c:/Users/Albino/Downloads/50_profili_fittizi_disabilita.xlsx';
const outputFile = 'c:/Users/Albino/OneDrive/Documenti/Fatture SALVATE IL 29-12-2014/Desktop/carematch/src/lib/dummyData.ts';

const regions = [
    { name: 'Lombardia', provinces: ['Milano', 'Brescia', 'Bergamo'] },
    { name: 'Lazio', provinces: ['Roma', 'Latina', 'Frosinone'] },
    { name: 'Piemonte', provinces: ['Torino', 'Cuneo', 'Novara'] },
    { name: 'Campania', provinces: ['Napoli', 'Salerno', 'Caserta'] }
];

function getRandomGeo() {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const province = region.provinces[Math.floor(Math.random() * region.provinces.length)];
    return { region: region.name, province: province };
}

function processCaregivers(file) {
    const workbook = xlsx.readFile(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    return rows.map((row, index) => {
        const geo = getRandomGeo();
        return {
            id: `cg-auto-${index + 1}`,
            name: row['Nome'] || `Caregiver ${index + 1}`,
            role: 'caregiver',
            region: geo.region,
            province: geo.province,
            raw_competenze_esperienze: row['Competenze ed Esperienze Professionali'] || '',
            raw_approccio_cura: row['Approccio e Filosofia di Cura'] || '',
            raw_stile_relazionale: row['Interessi e Passioni Personali'] || '',
            raw_gestione_stress: row['Ritmi e Abitudini Quotidiane'] || '',
            raw_valori_personali: row['Aspettative e Valori Relazionali'] || ''
        };
    });
}

function processDisabled(file) {
    const workbook = xlsx.readFile(file);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    return rows.map((row, index) => {
        const geo = getRandomGeo();
        return {
            id: `dp-auto-${index + 1}`,
            name: row['Nome'] || `Persona ${index + 1}`,
            role: 'disabled',
            region: geo.region,
            province: geo.province,
            raw_contexto_vita: row['Contesto e Ambiente di Vita'] || '',
            raw_bisogni_assistenziali: row['Bisogni ed Esigenze di Supporto'] || '',
            raw_stile_relazionale: row['Stile di Vita e Passioni'] || '',
            raw_ritmo_quotidiano: row['Ritmi e Gestione del Tempo'] || '',
            raw_valori_convivenza: row['Valori e Regole di Convivenza'] || ''
        };
    });
}

console.log('--- Inizio conversione Profili ---');

try {
    const caregivers = processCaregivers(caregiverFile);
    const disabled = processDisabled(disabledFile);

    const tsContent = `export const DUMMY_CAREGIVERS = ${JSON.stringify(caregivers, null, 4)};\n\nexport const DUMMY_DISABLED_PEOPLE = ${JSON.stringify(disabled, null, 4)};\n`;

    fs.writeFileSync(outputFile, tsContent);
    console.log(`Successo! 100 profili generati in: ${outputFile}`);
} catch (err) {
    console.error('Errore durante la conversione:', err.message);
}
