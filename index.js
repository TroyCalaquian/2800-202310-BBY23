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
const playlistCollection = database
  .db(mongodb_database)
  .collection("playlists");

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

function hasSession(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/", (req, res) => {
  var sessionState = req.session.authenticated;
  var username = req.session.name;

  res.render("welcome", { isLoggedIn: sessionState, userName: username });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/loggingin", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  const schema = Joi.string().email().required();
  const validationResult = schema.validate(email);

  if (validationResult.error != null) {
    console.log(validationResult.error);
    res.redirect("/login");
    return;
  }

  const result = await userCollection
    .find({ email: email })
    .project({ email: 1, password: 1, _id: 1 })
    .toArray();

  console.log(result);
  if (result.length != 1) {
    console.log("user not found");
    res.redirect("/login");
    return;
  }
  if (await bcrypt.compare(password, result[0].password)) {
    console.log("correct password");
    req.session.authenticated = true;
    req.session.email = email;
    req.session.cookie.maxAge = expireTime;
    var user = await userCollection.findOne({ email: email });
    req.session.name = user.username;
    req.session.user = user;
    // console.log(user)
    // console.log("###########################")
    // console.log(req.session.email)
    res.redirect("/loggedIn");
    return;
  } else {
    console.log("incorrect password");
    res.render("loginfail");
    return;
  }
});

app.get("/loggedin", hasSession, (req, res) => {
  res.redirect("/welcome");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// After signup, posts to this

app.post("/submitUser", async (req, res) => {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var securityQuestion = req.body.security_question;
  var securityAnswer = req.body.answer;

  const schema = Joi.object({
    username: Joi.string().alphanum().max(20).required(),
    email: Joi.string().email().required(),
    password: Joi.string().max(20).required(),
    securityAnswer: Joi.string().alphanum().max(20).required(),
  });

  const validationResult = schema.validate({
    username,
    email,
    password,
    securityAnswer,
  });
  if (validationResult.error != null) {
    console.log(validationResult.error);
    var error = validationResult.error.details[0].message;
    res.render("signupfail", { theError: error });
    return;
  }

  var hashedPassword = await bcrypt.hash(password, saltRounds);

  await userCollection.insertOne({
    username: username,
    password: hashedPassword,
    email: email,
    Security_Question: securityQuestion,
    Security_Question_Answer: securityAnswer,
    user_type: "user",
    pfp: null,
    playlists: [],
  });
  console.log("Inserted user");

  res.redirect("/welcome");
});

app.get("/welcome", hasSession, (req, res) => {
  res.render("welcome", {
    isLoggedIn: req.session.authenticated,
    userName: req.session.name,
  });
});

app.get("/changePassword", (req, res) => {
  var sessionState = req.session.authenticated;
  if (sessionState) {
    res.render("resetPassword", { sessionState: sessionState });
  } else {
    res.render("securityQuestion", { firstEntrance: true});
  }
});

app.post("/changingPassword", async (req, res) => {
  var newpassword = req.body.password;
  var useremail = req.session.email;
  console.log(useremail);
  let currentUser = await userCollection.findOne({ email: useremail });
  console.log("hello");
  console.log(currentUser);
  console.log(currentUser.email);
  console.log(currentUser.password);
  var hashedPassword = await bcrypt.hash(newpassword, saltRounds);
  await userCollection.updateOne(
    { email: useremail },
    { $set: { password: hashedPassword } }
  );
  console.log("=========NEW PASS=========");
  console.log(newpassword);
  console.log(hashedPassword);

  if (req.session.authenticated) {
    console.log(currentUser.username + "going to welcome");

    res.render("welcome", {
      userName: currentUser.username,
      isLoggedIn: req.session.authenticated,
    });
  } else {
    res.render("login");
  }
});

app.post("/securityQuestion", async (req, res) => {
  var userNotFound = false;
  var securityans = req.body.answer;
  var useremail = req.body.email;
  console.log("User email: "+ useremail);//-----------
  if(useremail != undefined){
    req.session.email = useremail;
  }
  console.log("Session email: "+ req.session.email);//-----------
  var incorrectEmailMessage = "No user under that email exists";
  let currentUser = await userCollection.findOne({ email: req.session.email });
  console.log("CurrentUser email: "+ currentUser);//-----------
  console.log("entered ans " + securityans + " emails ans " + currentUser.Security_Question_Answer);
  if (!currentUser) {
    userNotFound = true;
    res.render("securityQuestion", {firstEntrance: false, userState: userNotFound, incorrectEmail: incorrectEmailMessage});
  }else if (currentUser.Security_Question_Answer == securityans){
    res.render("resetPassword");
  } 
  else {
    userNotFound = false;
    var usersQuestion = currentUser.Security_Question;
    res.render("securityQuestion", {firstEntrance: false, userState: userNotFound, securityQuestion: usersQuestion});
  } 
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  var sessionState = false;
  var username = "";

  res.render("welcome", { isLoggedIn: sessionState, userName: username });
});

app.get("/home", hasSession, (req, res) => {
  res.render("index");
});

app.get("/profile", hasSession, (req, res) => {
  var username = req.session.name;
  res.render("profile", {userName: username});
});

app.get("/pickTags", hasSession, (req, res) => {
  req.session.pickedTags = req.session.pickedTags || [];
  req.session.blacklistedTags = req.session.blacklistedTags || [];
  // These have to be strings
  // TODO: Add more tags. Possibly store them in a database
  // TODO: Find a way to transfer tags between pages
  var tags = ["test1", "test2", "tag3", "tag4", "tag5", "tag6"];

  // Get the search query from the URL query parameters
  const searchQuery = req.query.search || "";

  // Filter the tags based on the search query
  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  res.render("pickTags", {
    tags: filteredTags,
    pickedTags: req.session.pickedTags,
    blacklistedTags: req.session.blacklistedTags,
  });
});

app.post("/resetTags", hasSession, (req, res) => {
  // Reset the pickedTags and blacklistedTags arrays in the session object
  req.session.pickedTags = [];
  req.session.blacklistedTags = [];

  res.redirect("/pickTags");
});

app.post("/updateTags", hasSession, (req, res) => {
  const tags = req.body.tags; // Array of selected tags
  const actions = req.body.actions; // Array of corresponding actions for each tag

  console.log("tags: " + tags);
  console.log("actions: " + actions);

  // Retrieve the pickedTags and blacklistedTags arrays from the session object
  let pickedTags = [];
  let blacklistedTags = [];

  // TODO: Add check for whether the user already inputted a playlist
  if (typeof tags === "undefined" || tags.length == 0) {
    // No tags were selected
    res.redirect("/confirmTags");
    return;
  }

  for (let i = 0; i < tags.length; i++) {
    var tag = tags[i];
    var action = actions[i];

    // Handle the selected action for each tag
    if (action === "add") {
      pickedTags.push(tag); // Add the tag to the pickedTags array
    } else if (action === "blacklist") {
      blacklistedTags.push(tag); // Add the tag to the blacklistedTags array
    } else if (action === "blank") {
      // Remove the tag from both arrays, if it exists
      // Note: this might not be needed later
      pickedTags = pickedTags.filter((pickedTag) => pickedTag !== tag);
      blacklistedTags = blacklistedTags.filter(
        (blacklistedTag) => blacklistedTag !== tag
      );
    }
  }

  // Store the pickedTags and blacklistedTags arrays in the session object
  req.session.pickedTags = pickedTags;
  req.session.blacklistedTags = blacklistedTags;

  // Redirect back to the /pickTags page or any other desired page
  res.redirect("/confirmTags");
});

app.get("/confirmTags", hasSession, (req, res) => {
  console.log("Picked tags length: " + req.session.pickedTags.length);
  console.log("Blacklisted tags length: " + req.session.blacklistedTags.length);
  res.render("confirmTags", {
    pickedTags: req.session.pickedTags,
    blacklistedTags: req.session.blacklistedTags,
  });
});

app.post("/confirmChoices", hasSession, async (req, res) => {
  // TODO: Put AI stuff here
  res.redirect("/results");
});

app.get("/results", hasSession, (req, res) => {
  console.log("PickedTags: " + req.session.pickedTags);
  console.log("BlacklistedTags: " + req.session.blacklistedTags);
  res.render("results");
});

app.get("/addMusic", hasSession, (req, res) => {
  res.render("addMusic");
});

app.post("/editUsername", hasSession, async (req, res) => {
  var username = req.body.username;
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
  });

  const validationResult = schema.validate({ username: username });
  if (validationResult.error) {
    console.log(validationResult.error);
    // Possibly render an error page? Or popup?
    return;
  }

  await userCollection.updateOne(
    { username: req.session.name },
    { $set: { username: username } }
  );
  res.redirect("/profile");
});

app.post("/editPhoto", async (req, res) => {
  if (!req.file || !req.file.mimetype.startsWith("image/")) {
    res.status(400).send("Please select a valid image file.");
    return;
  }

  try {
    const photoData = req.file.buffer; // Access the photo buffer directly

    // Update the photo field for the current user in the users collection
    await userCollection.updateOne(
      { username: req.session.username },
      { $set: { photo: photoData } }
    );

    res.redirect("/profile");
  } catch (error) {
    console.error("Failed to update photo:", error);
    res.status(500).send("Failed to update photo.");
  }
});

app.use(express.static(__dirname + "/public"));

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});
