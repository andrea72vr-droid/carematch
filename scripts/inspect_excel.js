const xlsx = require('xlsx');
const path = require('path');

const files = [
    'c:/Users/Albino/Downloads/50_caregiver_fittizi.xlsx',
    'c:/Users/Albino/Downloads/50_profili_fittizi_disabilita.xlsx'
];

files.forEach(file => {
    console.log(`\n--- Inspecting: ${path.basename(file)} ---`);
    try {
        const workbook = xlsx.readFile(file);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        if (data.length > 0) {
            console.log('Headers:', data[0]);
            console.log('Sample Row 1:', data[1]);
            console.log('Total Rows:', data.length - 1);
        } else {
            console.log('File is empty.');
        }
    } catch (err) {
        console.error(`Error reading ${file}:`, err.message);
    }
});
