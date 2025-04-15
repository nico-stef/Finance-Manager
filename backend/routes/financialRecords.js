const express = require('express');
const app = express();
const router = express.Router();
const connection = require("../database");

const usefulFunctions = require("../queryFunction");
const queryFunction = usefulFunctions.queryAsync;

app.use(express.urlencoded({ extended: false })); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

router.get("/expenses", async (req, res) => {

    const { account_id, userid } = req.query; //daca vrem toate accounts, nu transmitem account_id in query. sau transmitem valori falsy

    const acc = account_id==="total" ? null : account_id; //daca vrem sa stim totalul inlocuim cu null ca sa ia toate accounts in considereare

    const query =  `SELECT amount, date, c.category, note, icon, idexpenses
                    FROM expenses e
                    JOIN accounts a ON a.idaccounts = e.account_id
                    JOIN categories c ON c.idcategories = e.category_id
                    WHERE (a.idaccounts = ? OR ? IS NULL) AND a.id_user = ?
                    ORDER BY date DESC;`;

    try {
        const result = await queryFunction(query, [acc, acc, userid]); //array de obiecte cu categoriile
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting expenses records" });
    }

})

router.get("/incomes", async (req, res) => {

    const { account_id, userid } = req.query; //daca vrem toate accounts, nu transmitem account_id in query. sau transmitem valori falsy

    const acc = account_id==="total" ? null : account_id; //daca vrem sa stim totalul inlocuim cu null ca sa ia toate accounts in considereare

    const query =  `SELECT amount, date, note, idincomes
                    FROM incomes i
                    JOIN accounts a ON a.idaccounts = i.account_id
                    WHERE (a.idaccounts = ? OR ? IS NULL) AND a.id_user = ?
                    ORDER BY date DESC;`;

    try {
        const result = await queryFunction(query, [acc, acc, userid]); //array de obiecte cu categoriile
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting incomes records" });
    }

})

router.patch("/expenses/update/:idexpense", async (req, res) => {

    const idexpense = parseInt(req.params.idexpense, 10);
    console.log(idexpense)
    const { date, amount, category, note } = req.body;

    const query1 =  `SELECT idcategories FROM categories WHERE category = ?;`;

    const query2 = `UPDATE expenses
                    SET category_id = ?, date = ?, amount = ?, note = ?
                    WHERE idexpenses = ?`

    try {
        const category_id = await queryFunction(query1, [category]); //array de obiecte cu categoriile
        const dateExtracted = date.split('T')[0];
        // console.log()
        const result = await queryFunction(query2, [category_id[0].idcategories, dateExtracted, amount, note, idexpense]);
        res.status(200).json({ message: 'Expense updated successfully' });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at updating expense record" });
    }

})

router.delete("/expenses/delete/:idexpense", async (req, res) => {

    const idexpense = parseInt(req.params.idexpense, 10);

    const query1 =  `DELETE FROM expenses WHERE idexpenses = ?;`;

    try {
        const result = await queryFunction(query1, [idexpense]);
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at deleting expense record" });
    }

});

router.patch("/incomes/update/:idincome", async (req, res) => {

    const idincome = parseInt(req.params.idincome, 10);
    const { date, amount, note } = req.body;

    // const query1 =  `SELECT idcategories FROM categories WHERE category = ?;`;

    const query2 = `UPDATE incomes
                    SET date = ?, amount = ?, note = ?
                    WHERE idincomes = ?`

    try {
        // const category_id = await queryFunction(query1, [category]); //array de obiecte cu categoriile
        const dateExtracted = date.split('T')[0];
        const result = await queryFunction(query2, [dateExtracted, amount, note, idincome]);
        res.status(200).json({ message: 'Income updated successfully' });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at updating income record" });
    }

});

router.delete("/incomes/delete/:idincome", async (req, res) => {

    const idincome = parseInt(req.params.idincome, 10);

    const query1 =  `DELETE FROM incomes WHERE idincomes = ?;`;

    try {
        const result = await queryFunction(query1, [idincome]);
        res.status(200).json({ message: 'Income deleted successfully' });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at deleting income record" });
    }

});

module.exports = router;