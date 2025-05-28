const express = require('express');
const app = express();
const router = express.Router();
const connection = require("../database");

const usefulFunctions = require("../queryFunction");
const queryFunction = usefulFunctions.queryAsync;
const authenticateToken = usefulFunctions.authenticateToken;

app.use(express.urlencoded({ extended: false })); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

//open ai api
const dotenv = require('dotenv');
const OpenAI = require('openai');
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY,
});

console.log("api key: ", process.env.OPEN_AI_KEY)

function expandRecurringBudgets(budgets, currentDate = new Date()) {
    const result = [];

    budgets.forEach(budget => {
        const frequency = parseInt(budget.frequency);

        if (frequency === 1) {
            result.push({
                name: budget.name,
                amount: budget.amount,
                month: budget.month
            });
        } else if (frequency === 2) {
            const start = new Date(budget.month + '-02T00:00:00');
            const end = budget.endDate
                ? new Date(budget.endDate + '-02T00:00:00')
                : new Date(currentDate.getFullYear(), currentDate.getMonth(), 2);

            const temp = new Date(start);

            while (temp <= end) {
                const monthStr = temp.toISOString().slice(0, 7); // ex: 2025-05

                result.push({
                    name: budget.name,
                    amount: budget.amount,
                    month: monthStr
                });

                temp.setMonth(temp.getMonth() + 1);
            }
        }
    });

    return result;
}


router.get("/getAdvices", authenticateToken, async (req, res) => {

    const userId = req.user.userid;

    const query = `SELECT SUM(amount) as income, DATE_FORMAT(i.date, '%Y-%m') AS monthIncome
                    FROM incomes i
                    JOIN accounts a ON a.idaccounts = i.account_id
                    WHERE a.id_user = ?  AND i.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                    GROUP BY DATE_FORMAT(i.date, '%Y-%m');`;

    const queryExpensesCategories = `SELECT c.category, SUM(e.amount) AS total, DATE_FORMAT(e.date, '%Y-%m') AS monthExpenses
                    FROM expenses e
                    JOIN categories c ON c.idcategories = e.category_id
                    JOIN accounts a ON a.idaccounts = e.account_id
                    WHERE a.id_user = ? AND e.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                    GROUP BY c.category, DATE_FORMAT(e.date, '%Y-%m');`;

    const queryBudget = `SELECT b.name, b.amount, DATE_FORMAT(b.month, '%Y-%m') AS month, frequency, DATE_FORMAT(b.end_date, '%Y-%m') AS endDate
                        FROM budgets b
                        WHERE b.user_id = ?
                        AND (
                            (
                            b.frequency = 1 
                            AND b.month >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 2 MONTH), '%Y-%m-01')
                            )
                            OR
                            (
                            b.frequency = 2
                            AND (
                                b.end_date IS NULL OR b.end_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                            )
                            AND b.month <= LAST_DAY(DATE_SUB(CURDATE(), INTERVAL 0 MONTH))
                            )
                        );
                        `;

    const queryExpenses = `SELECT c.category, e.amount, e.date, e.note, b.name as budget_name
                    FROM expenses e
                    JOIN categories c ON c.idcategories = e.category_id
                    JOIN budgets b ON b.idbudgets = e.budget_id
                    JOIN accounts a ON a.idaccounts = e.account_id AND e.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                    WHERE a.id_user = ?;`;

    try {
        const result1 = await queryFunction(query, [userId]);
        const result2 = await queryFunction(queryExpensesCategories, [userId]);
        const result3 = await queryFunction(queryBudget, [userId]);
        const result4 = await queryFunction(queryExpenses, [userId]);
        const newBudgets = expandRecurringBudgets(result3);

        const dataToSend = JSON.stringify({
            incomes: result1,
            expenses: result2,
            budgets: result3,
            expenses: result4
        }, null, 2);

        const responseOpenAI = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'Ești un asistent util.' },
                {
                    role: 'user', content: `I will send you my financial data for the past 3 months in JSON format. Please analyze my incomes, expenses, and budgets, and give me practical advice on how I can:
                                        - save more money each month,
                                        - reduce unnecessary expenses,
                                        - and optimize my monthly budget.

                                        The fields are as follows:
                                        - incomes: my total income per month (income) and the corresponding month (monthIncome)
                                        - expenses: my total expenses grouped by category and month. Note means a note that the user has added as a short description. budget_name is the budget that the expense is associated to.
                                        - budgets: planned budgets for different purposes
                                        Here is the data: ${dataToSend}.
                                        Based on the JSON data below, please do the following:

                                        
                                        
                                        1. Highlight at least 2 categories where I could reduce spending.
                                        2. Suggest a savings strategy for the next 3 months based on my income fluctuations.
                                        If some months do not have data associated, dont mention them.
                                        These are fictional or anonymized financial data provided for analysis. Please feel free to process and interpret them.
                                        Make the response concise and friendly.
                                        Please return the response without using bullet points or lines starting with '-' or '*'. I want only simple paragraphs without any list markers
                                        `}
            ],
        });

        console.log(responseOpenAI.choices[0].message.content)
        return res.status(200).json(responseOpenAI.choices[0].message.content);
        return res.status(200).json({ incomes: result1, expenses: result2, budgets: newBudgets, expenses: result4 });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting objectives" });
    }

});

module.exports = router;