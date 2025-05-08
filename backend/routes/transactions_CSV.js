const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();

const app = express();
const PORT = process.env.PORT || 3000;
// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function isValidDateFormat(value) {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    return dateRegex.test(value);
}

router.post('/tranzactiiExtras', upload.single('file'), (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });


        let results = [];
        let startParsing = false;

        jsonData.forEach((row, index) => {
            if (!startParsing && row[0] === 'Data inregistrare') {
                startParsing = true;
                return;
            }

            if (startParsing && row[0]) {
                if (!isValidDateFormat(row[0]))
                    return;
                results.push({
                    dataInregistrare: row[0],
                    dataTranzactie: row[1],
                    debit: row[2],
                    credit: row[3],
                    detalii: row[11],
                });
            }
        });

        console.log('Total rânduri:', results.length);


        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the uploaded file' });
    }
});


// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const xlsx = require('xlsx');
// const router = express.Router();

// // configurare multer
// const upload = multer({ dest: 'uploads/' });

// router.post('/tranzactiiExtras', upload.single('file'), (req, res) => {
//     const results = [];
//     let startParsing = false;

//     // Read the Excel file
//     const workbook = xlsx.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];  // Assuming we're working with the first sheet
//     const sheet = workbook.Sheets[sheetName];

//     // Convert the sheet to JSON format
//     const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

//     // Process the rows
//     data.forEach((row, index) => {
//         // Skip header row or any unwanted rows
//         if (!startParsing && row[0] === 'Data inregistrare') {
//             startParsing = true;
//             return;  // skip header row
//         }

//         if (startParsing && row[0]) {
//             // Ensure that Suma debit and Suma credit are strings before calling replace
//             const sumaDebit = (row[2] !== undefined && row[2] !== null ? String(row[2]) : '0').replace(',', '.');
//             const sumaCredit = (row[3] !== undefined && row[3] !== null ? String(row[3]) : '0').replace(',', '.');

//             results.push({
//                 dataInregistrare: row[0],  // Assuming 'Data inregistrare' is in the first column
//                 dataTranzactie: row[1],     // Assuming 'Data tranzactiei' is in the second column
//                 sumaDebit: parseFloat(sumaDebit),  // Ensure it is a valid number
//                 sumaCredit: parseFloat(sumaCredit),  // Ensure it is a valid number
//                 beneficiar: row[4],  // Assuming 'Beneficiar final' is in the fifth column
//                 denumire: row[5],     // Assuming 'Nume/Denumire ordonator/beneficiar' is in the sixth column
//                 detalii: row[11]
//             });
//         }
//     });

//     // Delete the uploaded file after processing
//     fs.unlinkSync(req.file.path);
//     res.json(results);
// });

module.exports = router;
