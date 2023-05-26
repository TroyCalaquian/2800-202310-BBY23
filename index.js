/* Module requirements */
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const genreMulter = multer();
const MongoStore = require("connect-mongo");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const fs = require("fs");

/* Multer Values */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const sharp = require("sharp");

const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

/* Required Values */
const app = express();
const port = 3000;
const expireTime = 60 * 60 * 1000;
const saltRounds = 12;
var pickedTags = [];
var blacklistedTags = [];
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/* Linked JS file's functions */
const { runpyfile } = require("./AI.js");
const {
  getAccessToken,
  getTracksFromSongIDs,
  getTracksFromPlayList,
  getPlaylistName,
  parseUserInput,
  getTracks,
  getRandomSongIDs,
} = require("./public/scripts/spotifyAPI.js");
require("./utils.js");

/* Node Server Setups */
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));

/* MongoDB Secrets & Variables */
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

/* Database Connections */
var { database } = include("databaseConnection");
const userCollection = database.db(mongodb_database).collection("users");
const playlistCollection = database
  .db(mongodb_database)
  .collection("playlists");

/* Spotify Variables */
const redirectURI = "http://localhost:3000/callback";
const successRedirect = "/success";
const errorRedirect = "/error";

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

app.use(async function (req, res, next) {
  const userLoginStatus = req.session.authenticated || false;
  res.locals.userLoginStatus = userLoginStatus;
  if (res.locals.userLoginStatus) {
    const user = await userCollection.findOne({ username: req.session.name });
    res.locals.user = user;
  } else {
    res.locals.user = null;
  }
  next();
});

function hasSession(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect("/login");
  }
}

app.get("/inputSong", hasSession, async (req, res) => {
  let addedSongs = req.query.addedSongs || [];

  if (typeof addedSongs === "string") {
    addedSongs = addedSongs.split(","); // Split the string by commas to create an array
  }

  const parsedSongs = await getTracksFromSongIDs(addedSongs);

  res.render("userInput", { inputArray: parsedSongs });
});

app.get("/aiData", async (req, res) => {
  const songIdArray = req.query.addedSongs
    ? req.query.addedSongs.split(",")
    : [];

  parseUserInput(songIdArray);
  // await sendToAI()

  // Replaced by AI recommendation
  // const songRecommendations =   ['03tqyYWC9Um2ZqU0ZN849H', '03tqyYWC9Um2ZqU0ZN849H']
  const songRecommendationsString = await sendToAI();
  const songRecommendations = JSON.parse(songRecommendationsString);
  // console.log(typeof songRecommendations)
  // setTimeout(() => {
  const recommendationsQuery = songRecommendations
    .map((item) => encodeURIComponent(item))
    .join(",");
  // Encode and join the array
  res.redirect("/playlist?recommendations=" + recommendationsQuery);
  // }, 1500);
});

async function sendToAI() {
  file = "./inputtest.csv";
  var songID = await runpyfile(file);
  // const array = songID.split(','); // Split the string using comma as delimiter
  console.log(songID);
  return songID;
}

app.get("/playlist", async (req, res) => {
  await getAccessToken();

  const recommendations = req.query.recommendations
    ? req.query.recommendations.split(",")
    : [];

  // Gets array of song details to display on page
  const tracksDetails = await getTracksFromSongIDs(recommendations);

  res.render("success", { inputArray: tracksDetails });
});

app.get("/error", (req, res) => {
  res.render("error");
});

app.get("/", async (req, res) => {
  try {
    var sessionState = req.session.authenticated;
    var username = req.session.name;
    const randomSongIDs = await getRandomSongIDs(); // Get 3 random song IDs

    const tracksDetails = await getTracksFromSongIDs(randomSongIDs);

    res.render("index", {
      inputArray: tracksDetails,
      isLoggedIn: sessionState,
      userName: username,
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("error"); // Render the 'error' template in case of an error
  }
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  console.log("/callback passed");

  try {
    // Exchange authorization code for access and refresh tokens
    const authOptions = {
      url: "https://accounts.spotify.com/api/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: clientID,
        password: clientSecret,
      },
      data: querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectURI,
      }),
    };

    const response = await axios(authOptions);
    const { access_token, refresh_token } = response.data;

    // Use the access token to make API requests
    // e.g., get user profile details
    const userOptions = {
      url: "https://api.spotify.com/v1/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const userResponse = await axios(userOptions);
    const userProfile = userResponse.data;

    // Redirect to success page with user profile
    res.redirect(`${successRedirect}?${querystring.stringify(userProfile)}`);
  } catch (error) {
    console.error("Error:", error.message);
    // Redirect to error page
    res.redirect(errorRedirect);
  }
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

app.get("/loggedin", (req, res) => {
  res.redirect("/home");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/submitUser", upload.single("profilePicture"), async (req, res) => {
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

  const imagePath = __dirname + "/public/pictures/DefaultPFP.jpg";

  try {
    // Read the image file
    const photoData = fs.readFileSync(imagePath);

    if (!photoData || photoData.length === 0) {
      throw new Error("Empty photo data.");
    }

    // Resize the image to a maximum of 500x500 pixels
    // This will maintain the aspect ratio of the image
    const resizedImageData = await sharp(photoData)
      .resize(200, 200, {
        fit: sharp.fit.inside, // keep aspect ratio, don't crop the image
        withoutEnlargement: true, // don't enlarge if source image size is smaller than given size
      })
      .toBuffer();

    // Create a base64 data URL with the correct mime type
    const base64DataUrl = `data:image/jpeg;base64,${resizedImageData.toString(
      "base64"
    )}`;
    await userCollection.insertOne({
      username: username,
      password: hashedPassword,
      email: email,
      Security_Question: securityQuestion,
      Security_Question_Answer: securityAnswer,
      user_type: "user",
      pfp: base64DataUrl,
      playlists: [],
    });
    res.redirect("/home");
  } catch (error) {
    console.error("Failed to update photo:", error);
    res.status(500).send("Failed to update photo.");
  }
  console.log("Inserted user");
});

app.get("/changePassword", (req, res) => {
  var sessionState = req.session.authenticated;
  if (sessionState) {
    res.render("resetPassword", { sessionState: sessionState });
  } else {
    res.render("securityQuestion", { firstEntrance: true });
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

    res.render("profile", {
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
  console.log("User email: " + useremail); //-----------
  if (useremail != undefined) {
    req.session.email = useremail;
  }
  console.log("Session email: " + req.session.email); //-----------
  var incorrectEmailMessage = "No user under that email exists";
  let currentUser = await userCollection.findOne({ email: req.session.email });
  console.log("CurrentUser email: " + currentUser); //-----------
  console.log(
    "entered ans " +
      securityans +
      " emails ans " +
      currentUser.Security_Question_Answer
  );
  if (!currentUser) {
    userNotFound = true;
    res.render("securityQuestion", {
      firstEntrance: false,
      userState: userNotFound,
      incorrectEmail: incorrectEmailMessage,
    });
  } else if (currentUser.Security_Question_Answer == securityans) {
    res.render("resetPassword");
  } else {
    userNotFound = false;
    var usersQuestion = currentUser.Security_Question;
    res.render("securityQuestion", {
      firstEntrance: false,
      userState: userNotFound,
      securityQuestion: usersQuestion,
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();

  return res.redirect("/");
});

app.get("/home", hasSession, async (req, res) => {
  try {
    var sessionState = req.session.authenticated;
    var username = req.session.name;
    const randomSongIDs = await getRandomSongIDs(); // Get 3 random song IDs

    const tracksDetails = await getTracksFromSongIDs(randomSongIDs);

    res.render("index", {
      inputArray: tracksDetails,
      isLoggedIn: sessionState,
      userName: username,
    });
  } catch (error) {
    console.error("Error:", error);
    res.render("error"); // Render the 'error' template in case of an error
  }
});

app.get("/profile", hasSession, async (req, res) => {
  try {
    const user = await userCollection.findOne({ username: req.session.name });

    res.render("profile", { user: user, userName: req.session.name });
  } catch (error) {
    console.error("Failed to retrieve user data:", error);
    res.status(500).send("Failed to retrieve user data.");
  }
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

  req.session.name = username; // updating session with new username
  res.redirect("/profile");
});

app.post("/editPhoto", upload.single("profilePicture"), async (req, res) => {
  if (!req.file || !req.file.mimetype.startsWith("image/")) {
    res.status(400).send("Please select a valid image file.");
    return;
  }

  try {
    const photoData = req.file.buffer; // Access the photo buffer directly

    if (!photoData || photoData.length === 0) {
      throw new Error("Empty photo data.");
    }

    // Resize the image to a maximum of 500x500 pixels
    // This will maintain the aspect ratio of the image
    const resizedImageData = await sharp(photoData)
      .resize(200, 200, {
        fit: sharp.fit.inside, // keep aspect ratio, don't crop the image
        withoutEnlargement: true, // don't enlarge if source image size is smaller than given size
      })
      .toBuffer();

    // Create a base64 data URL with the correct mime type
    const base64DataUrl = `data:${
      req.file.mimetype
    };base64,${resizedImageData.toString("base64")}`;

    // Update the photo field for the current user in the users collection
    await userCollection.updateOne(
      { username: req.session.name },
      { $set: { pfp: base64DataUrl } }
    );

    console.log("Profile picture updated:", req.session.name);
    res.redirect("/profile");
  } catch (error) {
    console.error("Failed to update photo:", error);
    res.status(500).send("Failed to update photo.");
  }
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(port, () => {
  console.log("Node application listening on port " + port);
});
