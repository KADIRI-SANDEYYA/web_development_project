const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const passwordHash = require('password-hash');

const app = express();
const port = process.env.PORT || 2003;

app.use( express.static( "views"));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

const serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.get('/home', function (req, res) {
  res.sendFile(__dirname + "/public/" + "homepage.html");
});

app.get('/signup', function (req, res) {
  res.sendFile(__dirname + "/public/" + "signup.html");
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + "/public/" + "login.html");
});

app.get('/moviepage', function (req, res) {
  //res.render("moviepage");
  res.sendFile(__dirname + "/views/" + "moviepage.html");
});

app.post('/signupsubmit', function (req, res) {
  const { firstname, lastname, email, password} = req.body;
  db.collection("projectcollection")
    .where("Email", "==", email)
    .get()
    .then((docs) => {
      if (!docs.empty) {
        res.send("<center><h1>Sorry, this account already exists with this email</h1></center>");
      } else {
        const hashedPassword = passwordHash.generate(password);
        db.collection('projectcollection').add({
          Firstname: firstname,
          Lastname: lastname,
          Email: email,
          Password: hashedPassword
        })
          .then(() => {
            res.send("<center><h1>Signup  is  successful please <a href='/login'>Login</a> here</h1></center>");
          })
          .catch(() => {
            res.send("Something went wrong");
          });
      }
    })
    .catch(() => {
      res.send("Something went wrong");
    });
});
app.post('/loginsubmit', function (req, res) {
  const { email, password } = req.body;
  let dataPres = false;

  db.collection('projectcollection').get()
    .then((docs) => {
      docs.forEach((doc) => {
        if (email == doc.data().Email && passwordHash.verify(password, doc.data().Password)) {
          dataPres = true;
        }
      });

      if (dataPres) {
        res.send("<h2>Given data present in firebase database and click here for the <a href='/moviepage'>Movie search page</a></h2>");
      } else {
        res.send("<h2>Data not present in firebase database, Please login</h2>");
      }
    })
    .catch(() => {
      res.send("Something went wrong");
    });
});

app.listen(port, function () {
  console.log(`Your server is running on http://localhost:${port}/home`);
});
