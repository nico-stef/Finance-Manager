require('dotenv').config();
const express = require('express');
const app = express();
const connection = require('./database');
const port = 3000;
const jwt = require('jsonwebtoken');
const path = require('path');


//configuram rutele importand fisierul de rute
const configureRoutes = require('./routes/allRoutes');
configureRoutes(app);

//generarea de nou access token daca avem un refresh token
app.post('/refreshToken', (req, res) => {
  const refreshToken = req.body.token;
  console.log("refresh toke ", refreshToken)

  if (refreshToken == '') //daca refresh token e null
    return res.status(401).json({ message: 'refresh token null' });

  const data = [refreshToken];
  const query = `SELECT username, idusers from users WHERE refreshToken = ?;`;

  connection.query(query, data, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Eroare la executarea query-ului');
    }

    if(result.length > 0){ //refresh token trimis de user corespunde cu cel din baza de date

      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {//verificam daca refresh tokenul mai este valid
        if (err)
          return res.sendStatus(403);
    
        const accessToken = jwt.sign({name: user.name, userid: user.userid}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10s' }); //nu putem sa punem direct user pt ca
                                                                                                  // acum contine si alte date. cream obiectul {name: user.name}
        return res.json({ accessToken: accessToken });
      })
    }
    else{ //refresh token trimis de user NU corespunde cu cel din baza de date
      return res.status(500).json({ message: 'Nu s-a gasit refresh token-ul in baza de date' });
    }

  });
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
