const express = require('express');
const app = express();
const router = express.Router();

const usefulFunctions = require("../queryFunction");
const authenticateToken = usefulFunctions.authenticateToken;
const queryFunction = usefulFunctions.queryAsync;

app.use(express.urlencoded({extended: false})); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

router.get("/getUser", authenticateToken, async (req, res) => {  
    
    const username = req.query.username;

    const query = `SELECT * FROM users WHERE username = ?;`;
    const data = [username];

    try {
        const result = await queryFunction(query, data); // result returneaza un array de obiecte asa ca luam primul obiect(si singurul)
        const user ={
            id: result[0].idusers,
            username: result[0].username,
            name: result[0].name,
            phone: result[0].phone 
        }
        return res.status(200).json(user);
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({message: "user not found"});
    }

});

router.put('/updateUser', authenticateToken, async (req, res) =>{

    const {username, name, phone} = req.body;

    if (!username) {
        return res.status(400).json({ error: 'username null!' });
    };

    const query = `UPDATE users SET name=?, phone=? WHERE username = ?;`;
    const data = [name, phone, username];

    try {
        await queryFunction(query, data);
        return res.status(200).json("Data has been updated");
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({message: "user not found"});
    }
});

router.delete('/deleteUser', authenticateToken, async (req, res) =>{
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ error: 'username null!' });
    };

    const query = `DELETE FROM users WHERE username = ?;`;
    const data = [username];

    try {
        await queryFunction(query, data);
        return res.status(200).json("User deleted succesfully");
    } catch (err) {
        console.error("Eroare la executarea interogării:", err);
        return res.status(500).json({message: "user not found"});
    }
})

module.exports = router;