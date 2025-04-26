const express = require('express');
const app = express();
const router = express.Router();
const connection = require("../database");

const usefulFunctions = require("../queryFunction");
const queryFunction = usefulFunctions.queryAsync;
const authenticateToken = usefulFunctions.authenticateToken;

app.use(express.urlencoded({ extended: false })); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

router.post('/addObjective', async (req, res) => {

    const { name, amount, due_date, accountId, budgetId, note, userId } = req.body;

    if (!userId || !name || !amount || !accountId) {
        return res.status(400).json({ error: 'necessary fields null!' });
    };

    const query = `INSERT INTO objectives (name_objective, amount_allocated, due_date, account_id, budget_id, note, user_id) 
                   VALUES(?, ?, ?, ?, ?, ?, ?);`;
    const data = [name, amount, due_date, accountId, budgetId, note, userId];

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


module.exports = router;