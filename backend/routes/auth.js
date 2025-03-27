const express = require('express');
const app = express();
const router = express.Router();
const bcrypt = require("bcryptjs");
const connection = require("../database");
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

app.use(express.urlencoded({ extended: false })); //se ocupa de procesarea datelor trimise in format formular html
app.use(express.json()); //conversie din JSON in obiecte js

const google_client_id = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(google_client_id); //pentru a valida clientul google
// console.log("client:", client);

router.post("/register", async (req, res) => {
    const { username, password, name, phone } = req.body;
    const saltRounds = 10;
    var hashedPassword = '';

    if (!username || !password || !name || !phone) {
        return res.status(400).json({ error: 'Toate campurile sunt obligatorii!' });
    };

    //check if user with the same username already exists
    const query1 = `SELECT * FROM users WHERE username = ?;`;
    const data1 = [username];

    const result = await queryAsync(query1, data1);
    if (result.length > 0)
        return res.status(500).json({ message: 'User with this username already exists' });

    //continue with generating hashed password
    try {
        //generating the salt
        const salt = await bcrypt.genSalt(saltRounds);
        //hashing the password
        hashedPassword = await bcrypt.hash(password, salt);
    } catch (e) {
        console.log("Eroare la criptarea parolei: ", e);
        res.status(500).send('Eroare la criptarea parolei');
    }

    const data = [username, hashedPassword, name, phone];
    const query = `INSERT INTO users (username, password, name, phone) VALUES(?, ?, ?, ?);`;

    connection.query(query, data, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Eroare la inserarea înregistrării');
        }
        res.status(200).send('Utilizator înregistrat cu succes!');
    });
});

//functie necesara pentru login ca sa gestionam mai usor mai multe functii async
const queryAsync = (query, values) => {
    return new Promise((resolve, reject) => {
        connection.query(query, values, (err, result) => { //functia de callback primeste eroarea si rezultatul executiei query-ului
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const bcryptCompareAsync = async (password, hashedPassword) => {
    try {
        const result = await bcrypt.compare(password, hashedPassword);
        return result; //true daca parolele coincid
    } catch (err) {
        throw new Error('Eroare la compararea parolei');
    }
};

router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    let hashedPassword = '';

    //verificam daca parola introdusa de utilizator este aceeasi cu cea din baza de date
    if (!username || !password) {
        return res.status(400).json({ error: 'Campurile sunt goale!' });
    };

    const query = `SELECT * FROM users WHERE username = ?;`;
    const data = [username];

    const result = await queryAsync(query, data);
    if (result.length === 0)
        return res.status(500).json({ message: 'User does not exist' });

    hashedPassword = result[0].password;//result returneaza un array de obiecte asa ca luam primul obiect(si singurul)

    const equalPasswords = await bcryptCompareAsync(password, hashedPassword);

    if (!equalPasswords) {
        return res.status(401).json({ message: 'Incorrect password' });
    }

    //generare de tokenuri
    const user = { name: username, userid: result[0].idusers };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    //introducere a refresh token in baza de date. daca e successful, returnam token-urile
    const dataforRefreshToken = [refreshToken, username];
    const queryRefreshToken = `UPDATE users SET refreshToken = ? WHERE username = ?;`;

    connection.query(queryRefreshToken, dataforRefreshToken, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Eroare la inserarea înregistrării');
        }
        return res.json({ accessToken: accessToken, refreshToken: refreshToken });
    });

});

router.post("/loginGoogle", async (req, res) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({ error: 'Token-ul este gol!' });
    };

    // Validarea ID Token-ului Google
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: google_client_id
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    //verificam daca exista acest user deja in baza de date
    const query = `SELECT * FROM users WHERE username = ?;`;
    const data = [email];
    const result = await queryAsync(query, data);

    //daca user-ul se conecteaza pt prima data, il introducem in baza de date
    if (!result[0]) {
        const query = `INSERT INTO users (username, password, name, phone) VALUES(?, ?, ?, ?);`;
        const data = [email, "-", name, "-"];
        await queryAsync(query, data);
    }

    //generare de tokenuri
    const user = { name: email };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    //introducere a refresh token in baza de date. daca e successful, returnam token-urile
    const dataforRefreshToken = [refreshToken, email];
    const queryRefreshToken = `UPDATE users SET refreshToken = ? WHERE username = ?;`;

    connection.query(queryRefreshToken, dataforRefreshToken, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Eroare la inserarea înregistrării');
        }
        return res.json({ accessToken: accessToken, refreshToken: refreshToken });
    });

});

router.delete("/logout", async (req, res) => {
    const username = req.body.username;

    const query = `UPDATE users SET refreshToken = NULL WHERE username = ?`;
    const data = [username];

    try {
        await queryAsync(query, data);
        return res.status(200).send('Logout cu success');
    } catch (err) {
        return res.status(500).send('Eroare la stergerea înregistrării');
    }
});

module.exports = router;