require("./utils.js");

require("dotenv").config();

const express = require("express");
const app = express();

const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const port = 3000;

const Joi = require("joi");

const expireTime = 60 * 60 * 1000;

/* secret information section */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;

const node_session_secret = process.env.NODE_SESSION_SECRET;
/* END secret section */

var { database } = include("databaseConnection");

const userCollection = database.db(mongodb_database).collection("users");
const playlistCollection = database.db(mongodb_database).collection("playlists");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

var mongoStore = MongoStore.create({
  mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true&w=majority`,
  crypto: {
    secret: mongodb_session_secret,
  },
  dbName: "sessions",
});

app.use(
  session({
    secret: node_session_secret,
    store: mongoStore,
    saveUninitialized: false,
    resave: true,
  })
);

app.get('/', (req,res) => {
    var sessionState = req.session.authenticated;
    var username = req.session.username;

    res.render("index", {isLoggedIn: sessionState, userName: username});
});

app.get('/login', (req,res) => {
    res.render("login");
});

app.post('/loggingin', async (req,res) => {
    var username = req.body.username;
    var password = req.body.password;

    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(username);
    
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.redirect("/login");
      return;
    }

    const result = await userCollection.find({username: username}).project({username: 1, password: 1, _id: 1}).toArray();

    console.log(result);
    if (result.length != 1) {
      console.log("user not found");
      res.redirect("/login");
      return;
    }
    if (await bcrypt.compare(password, result[0].password)) {
      console.log("correct password");
      req.session.authenticated = true;
      req.session.username = username;
      req.session.cookie.maxAge = expireTime;

      res.redirect('/loggedIn');
      return;
    }
    else {
        console.log("incorrect password");
        res.render("loginfail");
        return;
    }
});

app.get('/loggedin', (req,res) => {
    if (!req.session.authenticated) {
        res.redirect('/login');
    }
    res.redirect('/welcome');
    
});

app.get('/signup', (req,res) => {
   res.render("signup");
});

// After signup, posts to this 

app.post('/submitUser', async (req,res) => {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.object(
      {
        username: Joi.string().alphanum().max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().max(20).required()
      });

    const validationResult = schema.validate({username, email, password});
    if (validationResult.error != null) {
      console.log(validationResult.error);
        var error = validationResult.error.details[0].message;
        res.render("signupfail", {theError: error});
      return;
    }

      var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({username: username, password: hashedPassword,email: email, user_type: 'user', pfp: null, playlists: []});
    console.log("Inserted user");

      res.redirect('/welcome');
});

app.get('/welcome', (req,res) => {
  var username = req.session.username;
  
  if (req.session.authenticated) {

      res.render("welcome", {user: username});

  }
  else {
      res.redirect('/login');
  }
});

app.get('/logout', (req,res) => {
	req.session.destroy();
    var sessionState = false;
    var username = "";

    res.render("index", {isLoggedIn: sessionState, userName: username});
});


app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});
