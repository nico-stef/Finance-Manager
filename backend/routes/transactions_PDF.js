const express = require('express');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

const app = express();
const router = express.Router();

// Servește fișierele statice din public/
app.use(express.static('public'));

// Multer setup
const upload = multer({ dest: 'uploads/' });

const usefulFunctions = require("../queryFunction");
const queryFunction = usefulFunctions.queryAsync;


const categorii = [
    {
        nume: 'food',
        cuvinteCheie: [
            'lidl', 'profi', 'auchan', 'carrefour', 'kaufland', 'mega image', 'penny', 'selgros', 'supeco', 'spar', 'minna'
        ]
    },
    {
        nume: 'transportation',
        cuvinteCheie: ['uber', 'bolt', 'taxi', 'autobuz', 'tramvai', 'metrorex']
    },
    {
        nume: 'car maintenance',
        cuvinteCheie: ['petrom', 'mol', 'omv', 'lukoil', 'rompetrol', 'benzinarie', 'service auto', 'vulcanizare', 'itp']
    },
    {
        nume: 'entertainment',
        cuvinteCheie: ['youtube', 'spotify', 'netflix', 'cinema', 'hbo', 'disney', 'jumbo', 'pepco']
    },
    {
        nume: 'other',
        cuvinteCheie: ['transfer', 'cont propriu', 'raiffeisen', 'banca']
    },
    {
        nume: 'personal care',
        cuvinteCheie: ['emag', 'fashion', 'h&m', 'zara', 'sephora', 'notino', 'douglas', 'dm', 'drogerie']
    },
    {
        nume: 'travel',
        cuvinteCheie: ['airbnb', 'booking', 'hotel', 'wizzair', 'ryanair', 'bilete avion']
    },
    {
        nume: 'health',
        cuvinteCheie: ['farmacie', 'medic', 'clinica', 'analize', 'dentist', 'drm']
    },
    {
        nume: 'education',
        cuvinteCheie: ['alumniversum', 'curs', 'udemy', 'elearning', 'scoala', 'manuale', 'carturesti']
    },
    {
        nume: 'other',
        cuvinteCheie: []
    }
];

function determinaCategoria(detalii) {
    const text = detalii.toLowerCase();
    for (const cat of categorii) {
        if (cat.cuvinteCheie.some(cuv => text.includes(cuv))) {
            return cat.nume;
        }
    }
    return 'other';
}
function formatDate(dateString) {

    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
}

const PDFParser = require('pdf2json');

function esteNumarValid(amount) {
    return /^\d+(,\d{3})*(\.\d{2})$|^\d+(\.\d{2})$/.test(amount);
}

function esteDataValida(data) {
    return /^\d{2}\.\d{2}\.\d{4}$|^\d{2}\/\d{2}\/\d{4}$/.test(data);
}

const IGNORE_TEXTS = [
    'Descrierea tranzac]iei',
    'Data tranzac]iei',
    'Sediul in Cl',
    'Raiffeisen Bank S.A.',
];


router.post('/extrasPDF_Raiffeisen', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Fișierul PDF lipsește' });
    }

    const filePath = req.file.path;
    const accountId = req.body.account_id;

    const parser = new PDFParser();

    parser.on('pdfParser_dataReady', async (pdfData) => {

        const transactions = [];
        const pages = pdfData.Pages;
        let currentTransaction = null;
        let detailBuffer = '';

        pages.forEach((page) => {
            page.Texts.forEach((textElement) => {
                const x = textElement.x;
                const text = decodeURIComponent(textElement.R[0].T);

                const COLUMN_RANGES = {
                    dataTranzactieRange: [0, 4],
                    debitRange: [25, 28],
                    creditRange: [30, 34]
                };

                if (x >= COLUMN_RANGES.dataTranzactieRange[0] && x <= COLUMN_RANGES.dataTranzactieRange[1]) {
                    // salvam tranzactia daca e completa
                    if (currentTransaction && currentTransaction.amount && currentTransaction.type && currentTransaction.dataTranzactie) {
                        currentTransaction.details = detailBuffer.trim(); //trebuie sa eliminam spatiile albe pt ca metode toLowerCase nu functioneaza pe ele

                        const alreadyExists = transactions.some(t => //stergem dublurile, vedem daca vreo tranzactie deja inregistrata e egala cu currentTransaction
                            t.dataTranzactie === currentTransaction.dataTranzactie &&
                            t.amount === currentTransaction.amount &&
                            t.type === currentTransaction.type &&
                            t.details === currentTransaction.details
                        );

                        if (!alreadyExists) {
                            transactions.push(currentTransaction); //daca nu mai exista deja inregistrarea, o adaugam
                        }
                    }

                    // incepe tranzactia noua daca gasim o data valida
                    if (esteDataValida(text)) {
                        currentTransaction = { dataTranzactie: formatDate(text) };
                        detailBuffer = '';
                    }
                } else if (x >= COLUMN_RANGES.creditRange[0] && x <= COLUMN_RANGES.creditRange[1]) {
                    if (esteNumarValid(text)) {
                        if (currentTransaction) {
                            currentTransaction.type = 'credit';
                            currentTransaction.amount = parseFloat(text.replace(/,/g, ''));
                        }
                    }
                } else if (x >= COLUMN_RANGES.debitRange[0] && x <= COLUMN_RANGES.debitRange[1]) {
                    if (esteNumarValid(text)) {
                        if (currentTransaction) {
                            currentTransaction.type = 'debit';
                            currentTransaction.amount = parseFloat(text.replace(/,/g, '')); // la raiffeisen sumele mai mari de 1000 au 1,200.34, si ca sa functioneze parsefloat trebuie sa elimin ,
                        }                                                                  //g- global, cautam toate aparitiile virgulei

                    }
                } else {
                    // Dacă nu e dată sau sumă, îl tratăm ca detaliu
                    if (!IGNORE_TEXTS.some(fragment => text.includes(fragment))) {//cautam in text daca exista fragment(un element din IGNORE_TEXTS)
                        detailBuffer += text + ' ';
                    }

                }
            });
        });

        transactions.forEach(record => record.category = determinaCategoria(record.details)); //adaugam si categorie la inregistrari

        queryExpense = `INSERT INTO expenses (amount, date, account_id, category_id) VALUES(?, ?, ?, (SELECT idcategories FROM categories WHERE category = ? LIMIT 1));`
        queryIncome = `INSERT INTO incomes (amount, date, account_id) VALUES(?, ?, ?);`
        for (i = 0; i < transactions.length; i++)
            if (transactions[i].type === 'debit') {
                const amount = transactions[i].amount;
                const date = transactions[i].dataTranzactie;
                const category = transactions[i].category;
                await queryFunction(queryExpense, [amount, date, accountId, category]);
            } else {
                const amount = transactions[i].amount;
                const date = transactions[i].dataTranzactie;
                await queryFunction(queryIncome, [amount, date, accountId]);
            }

        console.log(transactions.length)
        res.json({ transactions });
    });

    parser.on("pdfParser_dataError", (errData) => {
        console.error(errData.parserError);
        res.status(500).json({ error: 'Eroare la procesarea fișierului PDF' });
    });

    parser.loadPDF(filePath);
});



router.post('/extrasPDF_BRD', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Fișierul PDF lipsește' });
    }

    const filePath = req.file.path;

    const parser = new PDFParser();

    parser.on('pdfParser_dataReady', (pdfData) => {
        console.log('PDF Data Ready:', pdfData);

        const transactions = [];
        const pages = pdfData.Pages;
        let transaction = {}

        // Iterăm prin fiecare pagină
        pages.forEach((page, pageIndex) => {
            console.log(`Pagina ${pageIndex + 1}:`);
            page.Texts.forEach((textElement, index) => {
                const x = textElement.x;
                const y = textElement.y;
                const rawText = decodeURIComponent(textElement.R[0].T);

                console.log("rand nou: ", "X: ", x, "y: ", y, rawText)

                const COLUMN_RANGES = {
                    dataTranzactieRange: [0, 4],
                    debitRange: [20, 26], // debitRange: [25, 28],
                    creditRange: [27, 31]
                };

                if (x >= COLUMN_RANGES.dataTranzactieRange[0] && x <= COLUMN_RANGES.dataTranzactieRange[1]) {
                    if (esteDataValida(rawText))
                        transaction.data = rawText;
                }

                if (x >= COLUMN_RANGES.debitRange[0] && x <= COLUMN_RANGES.debitRange[1]) {
                    // if (esteNumarValid(rawText)) {
                    transaction.type = 'debit';
                    transaction.amount = rawText;
                    // }
                } else if (x >= COLUMN_RANGES.creditRange[0] && x <= COLUMN_RANGES.creditRange[1]) {
                    // if (esteNumarValid(rawText)) {
                    transaction.type = 'credit';
                    transaction.amount = rawText;
                    // }
                }

                if (transaction.type && transaction.amount && transaction.data) {
                    transactions.push({ ...transaction });
                    transaction = {};
                }

            });
        });

        console.log(transactions.length)
        res.json({ transactions });
    });

    parser.on("pdfParser_dataError", (errData) => {
        console.error(errData.parserError);
        res.status(500).json({ error: 'Eroare la procesarea fișierului PDF' });
    });

    parser.loadPDF(filePath);  // Încarcă fișierul PDF
});


module.exports = router;
