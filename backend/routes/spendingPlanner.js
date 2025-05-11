const express = require('express');
const app = express();
const router = express.Router();
const connection = require("../database");

const usefulFunctions = require("../queryFunction");
const queryFunction = usefulFunctions.queryAsync;
const authenticateToken = usefulFunctions.authenticateToken;

app.use(express.urlencoded({ extended: false })); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

router.post('/addObjective', authenticateToken, async (req, res) => {

    const { name, amount, due_date, accountId, budgetId, note, userId, categoryId } = req.body;

    if (!userId || !name || !amount || !accountId || !categoryId) {
        return res.status(400).json({ error: 'necessary fields null!' });
    };

    const query = `INSERT INTO objectives (name_objective, amount_allocated, due_date, account_id, budget_id, note, user_id, category_id) 
                   VALUES(?, ?, ?, ?, ?, ?, ?, ?);`;
    const data = [name, amount, due_date, accountId, budgetId, note, userId, categoryId];

    try {
        await queryFunction(query, data);
        return res.status(200).json("Row has been inserted into objectives");
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error add into objectives" });
    }
});

router.get("/getObjectives", authenticateToken, async (req, res) => {

    const userId = req.user.userid;

    const query =  `SELECT idObjective, name_objective, amount_allocated, due_date, account_id, budget_id, note
                    FROM objectives
                    WHERE user_id = ?
                    ORDER BY due_date DESC;`;

    try {
        const result = await queryFunction(query, [userId]);
        return res.status(200).json(result);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at getting objectives" });
    }

});


//options
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  const upload = multer({ storage })

router.post('/addOption', upload.single('photo'), async (req, res) => {

    const imagePath = req?.file?.path;
    const { name, price, note, objectiveId } = req.body;

    if (!price || !name || !objectiveId) {
        return res.status(400).json({ message: 'necessary fields null!' });
    };

    const query = `INSERT INTO options (name_option, price, imagePath, note, objective_id) 
                   VALUES(?, ?, ?, ?, ?);`;
    const data = [name, price, imagePath, note, objectiveId];

    try {
        const result = await queryFunction(query, data);
        return res.status(200).json({message: 'Option added successfully!'});
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at posting option" });
    }

});

router.get("/getOptions", authenticateToken, async (req, res) => {

    const {objectiveId} = req.query;

    if(!objectiveId)
        return res.status(500).json({ message: "objectiveId is null" });

    const query =  `SELECT idOption, name_option, price, chosen
                    FROM options
                    WHERE objective_id = ?;`;

    try {
        const result = await queryFunction(query, [objectiveId]);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: "error at getting options" });
    }
});

router.get("/getOption", authenticateToken, async (req, res) => {

    const {optionId} = req.query;

    if(!optionId)
        return res.status(500).json({ message: "optionId is null" });

    const query =  `SELECT name_option, price, imagePath, note, chosen
                    FROM options
                    WHERE idOption = ?;`;

    try {
        const result = await queryFunction(query, [optionId]);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: "error at getting option" });
    }
});

router.get("/getObjective", authenticateToken, async (req, res) => {

    const {objectiveId} = req.query;

    if(!objectiveId)
        return res.status(500).json({ message: "objectiveId is null" });

    const query =  `SELECT o.name_objective, o.amount_allocated, o.due_date, o.account_id, o.budget_id, o.note,
                           a.name AS account_name,
                           b.name AS budget_name,
                           c.category AS category_name
                    FROM objectives o
                    LEFT JOIN budgets b ON o.budget_id = b.idbudgets
                    JOIN accounts a ON o.account_id = a.idaccounts
                    JOIN categories c ON o.category_id = c.idcategories
                    WHERE idObjective = ?;`;

    try {
        const result = await queryFunction(query, [objectiveId]);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.delete("/deleteObjective/:idexpense", authenticateToken, async (req, res) => {

    const idObjective = parseInt(req.params.idexpense, 10);

    const query1 =  `DELETE FROM objectives WHERE idObjective = ?;`;

    try {
        const result = await queryFunction(query1, [idObjective]);
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at deleting objective" });
    }

});

router.delete("/deleteOption/:idOption", authenticateToken, async (req, res) => {

    const idOption = parseInt(req.params.idOption, 10);

    const query1 =  `DELETE FROM options WHERE idOption = ?;`;

    try {
        const result = await queryFunction(query1, [idOption]);
        res.status(200).json({ message: 'Option deleted successfully' });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at deleting option" });
    }

});

router.patch("/updateOption/:idOption", authenticateToken, async (req, res) => {

    const idOption = parseInt(req.params.idOption, 10);
    const { chosen } = req.body;

    const query1 =  `UPDATE options SET chosen = ? WHERE idOption = ?;`;

    try {
        const result = await queryFunction(query1, [chosen, idOption]);
        res.status(200).json({ message: 'Option updated successfully' });
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({ message: "error at updating option" });
    }

});

module.exports = router;