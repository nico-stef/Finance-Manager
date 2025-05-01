const express = require('express');
const app = express();
const router = express.Router();
const connection = require("../database");

const usefulFunctions = require("../queryFunction");
const queryFunction = usefulFunctions.queryAsync;

app.use(express.urlencoded({ extended: false })); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

router.get("/getExpensesPerCateogory", async (req, res) => {

    const { date, account_id, week_start, week_end, period, month, year, id_user } = req.query;
    const acc = account_id == 'total' ? null : account_id; //daca vrem sa stim totalul inlocuim cu null ca sa ia toate accounts in considereare

    const queryToday = `SELECT c.category, SUM(e.amount) AS total 
                    FROM expenses e
                    JOIN categories c ON c.idcategories = e.category_id
                    JOIN accounts a ON a.idaccounts = e.account_id
                    WHERE e.date = ? AND a.id_user = ?
                    GROUP BY c.category;`;

    const queryDay = `SELECT c.category, SUM(e.amount) AS total 
                    FROM expenses e
                    JOIN categories c ON c.idcategories = e.category_id
                    JOIN accounts a ON a.idaccounts = e.account_id
                    WHERE e.date = ? AND a.id_user = ? AND (a.idaccounts = ? OR ? IS NULL)
                    GROUP BY c.category;`;

    const queryWeek = `SELECT c.category, SUM(e.amount) AS total 
                    FROM expenses e
                    JOIN categories c ON c.idcategories = e.category_id
                    JOIN accounts a ON a.idaccounts = e.account_id
                    WHERE e.date >= ? AND e.date <= ? AND a.id_user = ? AND (a.idaccounts = ? OR ? IS NULL)
                    GROUP BY c.category;`;

    const queryMonth = `SELECT c.category, SUM(e.amount) AS total 
                    FROM expenses e
                    JOIN categories c ON c.idcategories = e.category_id
                    JOIN accounts a ON a.idaccounts = e.account_id
                    WHERE MONTH(e.date) = ? AND YEAR(e.date) = ? AND a.id_user = ? AND (a.idaccounts = ? OR ? IS NULL)
                    GROUP BY c.category;`;

    const queryYear = `SELECT c.category, SUM(e.amount) AS total 
                    FROM expenses e
                    JOIN categories c ON c.idcategories = e.category_id
                    JOIN accounts a ON a.idaccounts = e.account_id
                    WHERE YEAR(e.date) = ? AND a.id_user = ? AND (a.idaccounts = ? OR ? IS NULL)
                    GROUP BY c.category;`;

    try {
        switch (period) {
            case "today":
                const resultToday = await queryFunction(queryDay, [date, id_user, acc, acc]); //array de obiecte cu categoriile
                return res.status(200).json(resultToday);
            case "day":
                const resultDay = await queryFunction(queryDay, [date, id_user, acc, acc]); //array de obiecte cu categoriile
                return res.status(200).json(resultDay);
            case "week":
                const resultWeek = await queryFunction(queryWeek, [week_start, week_end, id_user, acc, acc]);
                return res.status(200).json(resultWeek);
            case "month":
                const resultMonth = await queryFunction(queryMonth, [month, year, id_user, acc, acc]);
                return res.status(200).json(resultMonth);
            case "year":
                const resultYear = await queryFunction(queryYear, [year, id_user, acc, acc]);
                return res.status(200).json(resultYear);
        }

    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting expenses" });
    }

});

router.get("/getExpenseTendencies/:userId", async (req, res) => {

    const { userId } = req.params;

    const query = `SELECT DATE_FORMAT(e.date, '%Y-%m') AS month, SUM(e.amount) AS total 
                    FROM expenses e
                    JOIN accounts a ON a.idaccounts = e.account_id
                    WHERE a.id_user = ? AND e.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                    GROUP BY month
                    ORDER BY month;`;

    try {
        const result = await queryFunction(query, [userId]); //array de obiecte
        return res.status(200).json(result);

    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting expense tendencies" });
    }

});

router.get("/budgetComparisson/:userId", async (req, res) => {

    const { userId } = req.params;

    const query = `SELECT DATE_FORMAT(e.date, '%Y-%m') AS month, SUM(e.amount) AS totalSpent
                    FROM expenses e
                    JOIN budgets b ON b.idbudgets = e.budget_id
                    WHERE b.user_id = ? AND e.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                    GROUP BY DATE_FORMAT(e.date, '%Y-%m')
                    ORDER BY month;`;

    const query2 = `SELECT DATE_FORMAT(month, '%Y-%m') AS monthBudget, SUM(amount) AS total_budget
                    FROM budgets
                    WHERE user_id = ? AND frequency != 2
                    AND month >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                    GROUP BY monthBudget
                  `;

    const query3 = `SELECT SUM(amount) AS recurring_total
                    FROM budgets
                    WHERE user_id = ? AND frequency = 2`;

    try {
        const  expensesMonthly = await queryFunction(query, [userId]);

        const  monthlyBudgets = await queryFunction(query2, [userId]);

        const  recurringTotal = await queryFunction(query3, [userId]);
        

        const recurringSum = recurringTotal[0].recurring_total || 0;

        const adjustedBudgets = monthlyBudgets.map(b => ({
            month: b.monthBudget,
            total_budget: parseFloat(b.total_budget) + parseFloat(recurringSum)
        }));

        return res.status(200).json({expensesMonthly, adjustedBudgets});

    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting budget comparisson data" });
    }

});

module.exports = router;