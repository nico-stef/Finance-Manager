const express = require('express');
const app = express();
const router = express.Router();
const connection = require("../database");

const usefulFunctions = require("../queryFunction");
const queryFunction = usefulFunctions.queryAsync;

app.use(express.urlencoded({ extended: false })); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

router.get("/getCategories", async (req, res) => {

    const query = `SELECT * FROM categories;`;

    try {
        const result = await queryFunction(query, ''); //array de obiecte cu categoriile
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting categories" });
    }

});

router.get('/getAccounts/:id_user', async (req, res) => {

    const { id_user } = req.params;

    if (!id_user) {
        return res.status(400).json({ error: 'id_user null!' });
    };

    const query = `SELECT * FROM accounts WHERE id_user = ?;`;
    const data = [id_user];

    try {
        const result = await queryFunction(query, data); //array de obiecte cu conturile
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting categories" });
    }
});

router.get('/getTags/:id_user', async (req, res) => {

    const { id_user } = req.params;

    if (!id_user) {
        return res.status(400).json({ error: 'id_user null!' });
    };

    const query = `SELECT * FROM tags WHERE user_id = ?;`;
    const data = [id_user];

    try {
        const result = await queryFunction(query, data); //array de obiecte cu tag-urile
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting tags" });
    }
});

router.post('/addTag', async (req, res) => {

    const { id_user, tag } = req.body;

    if (!id_user || !tag) {
        return res.status(400).json({ error: 'id user or tag null!' });
    };

    const query = `INSERT INTO tags (name, user_id) VALUES(?, ?);`;
    const data = [tag, id_user];

    try {
        await queryFunction(query, data);
        return res.status(200).json("Row has been inserted into tags");
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error add into tags" });
    }
});

router.delete('/deleteTags', async (req, res) => {
    const { user_id, idTags } = req.body;

    if (!user_id || !idTags) {
        return res.status(400).json({ error: 'null fields!' });
    };

    const query = `DELETE FROM tags WHERE user_id = ? AND idtags IN (?);`;
    const data = [user_id, idTags];

    try {
        await queryFunction(query, data);
        return res.status(200).json("Tags deleted succesfully");
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error delete tags" });
    }
});

router.post('/addExpense', async (req, res) => {

    const { id_user, amount, date, category_id, account_id, tags, note, budget_id } = req.body;

    if (!id_user || !amount || !date || !category_id || !account_id) {
        return res.status(400).json({ error: 'null fields!' });
    };

    //query introducere in tabelul expenses
    const query1 = `INSERT INTO expenses (amount, date, note, category_id, account_id, budget_id) VALUES(?, ?, ?, ?, ?, ?);`;
    const dateExtracted = date.split('T')[0];
    const data1 = [amount, dateExtracted, note, category_id, account_id, budget_id];

    try {
        const result = await queryFunction(query1, data1);
        const insertedId = result.insertId;

        //query introducere in tabelul expenses_tags
        if (tags.length > 0) {
            const query2 = `INSERT INTO expenses_tags (expense_id, tag_id) VALUES ?;`;
            const data2 = tags.map(tag => [insertedId, tag])
            await queryFunction(query2, [data2]);
        }

        return res.status(200).json("Expense succesfully added");
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error add into expenses" });
    }
});


//facem tranzactie datorita faptului ca este o unitate atomica,si ne asiguram ca operatiile se realizeaza
//in totalitate sau nu se realizeaza deloc
//pentru tranzactie avem nevoie de 'mysql2/promise'
const mysql = require('mysql2/promise');
require('dotenv').config();
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};
router.post('/addIncome', async (req, res) => {

    const { id_user, amount, date, account_id, note } = req.body;

    if (!id_user || !amount || !date || !account_id) {
        return res.status(400).json({ error: 'null fields!' });
    };

    const dateExtracted = date.split('T')[0];

    const connection = await mysql.createConnection(config);
    await connection.beginTransaction();
    try {
        const [result1] = await connection.query('INSERT INTO incomes SET ?', { amount: amount, date: dateExtracted, note: note, account_id });

        const [result2] = await connection.query('SELECT total FROM accounts WHERE idaccounts = ?', [account_id]);
        //la un camp de tip DECIMAL, FLOAT sau DOUBLE, rezultatul poate fi returnat sub forma de string în JS,
        //mai ales daca sunt folosite librarii precum mysql sau mysql2
        const newTotal = parseFloat(result2[0].total) + parseFloat(amount);

        const [result3] = await connection.query('UPDATE accounts SET total = ? WHERE idaccounts = ?', [newTotal, account_id]);

        await connection.commit();
        return res.status(200).json("Income succesfully added");
    } catch (err) {
        await connection.rollback(); //daca nu sunt successfull toate query-urile, dam rollback si nu avem nicio inregistrare noua
        console.error('Transaction Failed:', err);
    } finally {
        await connection.end();
    }
});


//BUDGETS

router.post('/addBudget', async (req, res) => {

    const { id_user, name, amount, date, freq, note } = req.body;

    if (!id_user || !name || !amount || !date) {
        return res.status(400).json({ error: 'necessary fields null!' });
    };

    let monthFormated = date.month.toString().padStart(2, '0');
    let dateFormated = `${date.year}-${monthFormated}-01`;
    console.log(dateFormated);

    const query = `INSERT INTO budgets (name, amount, month, frequency, note, user_id) VALUES(?, ?, ?, ?, ?, ?);`;
    const data = [name, amount, dateFormated, freq, note, id_user];

    try {
        await queryFunction(query, data);
        return res.status(200).json("Row has been inserted into budgets");
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error add into budgets" });
    }
});

router.get('/getBudgetsOptions/:id_user', async (req, res) => {

    const { id_user } = req.params;

    const query = `SELECT * FROM budgets WHERE user_id = ?;`;
    const data = [id_user]

    try {
        const result = await queryFunction(query, data);
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting categories" });
    }

});

router.get('/getBudgets/:id_user', async (req, res) => {

    const { id_user } = req.params;
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    const query1 = `SELECT b.idbudgets, b.name, b.amount, SUM(e.amount) AS total
                  FROM budgets b
                  LEFT JOIN expenses e ON e.budget_id = b.idbudgets AND MONTH(e.date) = ? AND YEAR(e.date) = ?
                  WHERE b.user_id = ? AND (b.frequency = 2 OR (MONTH(b.month) = ? AND YEAR(b.month) = ?))
                  GROUP BY b.idbudgets;`

    const data = [month, year, id_user, month, year]

    try {
        const result = await queryFunction(query1, data);
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting budgets" });
    }

});

module.exports = router;