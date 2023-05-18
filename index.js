require("./utils.js");

require("dotenv").config();

const SpotifyWebApi = require('spotify-web-api-node');

const express = require("express");
const app = express();

const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const saltRounds = 12;

const port = 3000;

const Joi = require("joi");

const expireTime = 60 * 60 * 1000;
var pickedTags = [];
var blacklistedTags = [];

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

/** Spotify variables, I hope to move everything spotify related to seperate JS file to declutter */
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectURI = 'http://localhost:3000/callback';
const successRedirect = '/success';
const errorRedirect = '/error';
const spotifyApi = new SpotifyWebApi({
  clientId: spotify_client_id,
  clientSecret: spotify_client_secret,
});
const playListCodeLocal = "6RcPwqOPVVyU3H9sRxJOrR";
const songCodeLocal = "5e9TFTbltYBg2xThimr0rU";

async function getTracksFromPlayList(playlistId) {
  try {
    const response = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks = response.body.items;

    const songsArray = []; // Create an empty array to store the entries

    // const songArtists = "";
    tracks.forEach((track, index) => {
      const { name, artists, external_urls } = track.track;
      const songUrlLocal = external_urls.spotify;
      console.log("\nURL: " + songUrlLocal + "\n");
      const artistNamesL = artists.map(artist => artist.name).join(', ');
      var jsonParsed = {songName: name, artists: artistNamesL, songURL: songUrlLocal};
      songsArray.push(jsonParsed); // Save each entry to the result array
    });

    return songsArray;
  } catch (error) {
    console.error('Error printing playlist songs:', error);
  }
}

async function getSongDetails(songCode) {
  const response = await spotifyApi.getAudioFeaturesForTrack(songCode)
  // .then(data => {
    // const sections = response.body.analysis_url;
    // console.log(sections)
  // })
  const audioFeatures = response.body;
  const trackInfo = await spotifyApi.getTrack(songCode);
  const { artists, name } = trackInfo.body;
  const artistNames = artists.map(artist => artist.name).join(', ');


  const extractedData = {
    songName: name,
    artists: artistNames,
    genre: audioFeatures.genre,
    danceability: audioFeatures.danceability,
    energy: audioFeatures.energy,
    key: audioFeatures.key,
    loudness: audioFeatures.loudness,
    mode: audioFeatures.mode,
    speechiness: audioFeatures.speechiness,
    acousticness: audioFeatures.acousticness,
    instrumentalness: audioFeatures.instrumentalness,
    liveness: audioFeatures.liveness,
    valence: audioFeatures.valence,
    tempo: audioFeatures.tempo,
  };

console.log("Stringify extractedData: " + JSON.stringify(extractedData, null, 2));
};

async function getaudianalysis(trackid){
  let analysis_url = spotifyApi.getAudioAnalysisForTrack(trackid)
  .then(function(data) {
    console.log(data.body);
  }, function(err) {
    done(err);
  });
}

app.get('/spotify', async (req, res) => {
  try {
    // Retrieve an access token to authenticate your requests
    const sData = await spotifyApi.clientCredentialsGrant();
    const accessToken = sData.body['access_token'];

    // Set the access token for subsequent API requests
    spotifyApi.setAccessToken(accessToken);

    res.redirect("success");
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/success', async (req, res) => {
  const tracksDetails = await getTracksFromPlayList(playListCodeLocal);
  const songDetails = await getSongDetails(songCodeLocal)
  getaudianalysis(songCodeLocal)
  
  if (!Array.isArray(tracksDetails)) {
    console.log('trackDetails is not an array @ /success');
  }
  // console.log("Analysis" + getAudioAnalysisForTrack)
  res.render('success', { inputArray: tracksDetails, playlistCode: playListCodeLocal, 
                          songObject: songDetails, songCode: songCodeLocal });
});

function printDirect(tracksInput) {
  tracksInput.forEach((track, index) => {
    const { name, artists } = track.track;
    const artistNames = artists.map(artist => artist.name).join(', ');
    console.log(`${index + 1}. ${name} - ${artistNames}`);
  });
}

function printArray(arrayInput) {
  arrayInput.forEach(function(track) {
    console.log(track);
  });
}

module.exports = {
  getTracksFromPlayList
}




app.get('/error', (req,res) => {
  res.render("error");
});

app.get('/', (req,res) => {
    var sessionState = req.session.authenticated;
    var username = req.session.name;

    res.render("welcome", {isLoggedIn: sessionState, userName: username});
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  console.log("/callback passed");

  try {
    // Exchange authorization code for access and refresh tokens
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: clientID,
        password: clientSecret,
      },
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectURI,
      }),
    };

    const response = await axios(authOptions);
    const { access_token, refresh_token } = response.data;

    // Use the access token to make API requests
    // e.g., get user profile details
    const userOptions = {
      url: 'https://api.spotify.com/v1/me',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    };

    const userResponse = await axios(userOptions);
    const userProfile = userResponse.data;

    // Redirect to success page with user profile
    res.redirect(`${successRedirect}?${querystring.stringify(userProfile)}`);
  } catch (error) {
    console.error('Error:', error.message);
    // Redirect to error page
    res.redirect(errorRedirect);
  }
});

app.get('/login', (req,res) => {
    res.render("login");
});

app.post('/loggingin', async (req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    const schema = Joi.string().email().required();
    const validationResult = schema.validate(email);
    
    if (validationResult.error != null) {
      console.log(validationResult.error);
      res.redirect("/login");
      return;
    }

    const result = await userCollection.find({email: email}).project({email: 1, password: 1, _id: 1}).toArray();

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

app.post('/submitUser', async (req,res) => {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var securityAnswer = req.body.answer;

    const schema = Joi.object(
      {
        username: Joi.string().alphanum().max(20).required(),
        email: Joi.string().email().required(),
        password: Joi.string().max(20).required(),
        securityAnswer: Joi.string().alphanum().max(20).required(),
      });

    const validationResult = schema.validate({username, email, password, securityAnswer});
    if (validationResult.error != null) {
      console.log(validationResult.error);
        var error = validationResult.error.details[0].message;
        res.render("signupfail", {theError: error});
      return;
    }

      var hashedPassword = await bcrypt.hash(password, saltRounds);

    await userCollection.insertOne({username: username, password: hashedPassword,email: email, Security_Question_Answer: securityAnswer,user_type: 'user', pfp: null, playlists: []});
    console.log("Inserted user");

      res.redirect('/welcome');
});

app.get('/welcome', (req,res) => {
  
  if (req.session.authenticated) {

      res.render("welcome", {isLoggedIn: req.session.authenticated, userName: req.session.name});

  }
  else {
      res.redirect('/login');
  }
});

app.get('/changePassword', (req,res) =>{
      var sessionState = req.session.authenticated;
      if(sessionState){
        res.render("resetPassword", {sessionState: sessionState});
      } else {
        res.render("securityQuestion");
      }

});

app.post('/changingPassword', async (req,res) => {
  
    var newpassword = req.body.password;
    var useremail = req.session.email;
    console.log(useremail);
    let currentUser = await userCollection.findOne({email: useremail});
    console.log("hello");
    console.log(currentUser);
    console.log(currentUser.email);
    console.log(currentUser.password);
    var hashedPassword = await bcrypt.hash(newpassword, saltRounds);
    await userCollection.updateOne({email: useremail}, {$set: {password: hashedPassword}});
    console.log("=========NEW PASS=========");
    console.log(newpassword);
    console.log(hashedPassword);
    
    if (req.session.authenticated){
      console.log(currentUser.username + "going to welcome");
      res.render("welcome", {user: currentUser.username});
    }else{
      res.render("login");
    }


});

app.post('/securityQuestion', async (req,res) => {
  var useremail = req.body.email;
  req.session.email = useremail;
  var securityans = req.body.answer;
  let currentUser = await userCollection.findOne({email: useremail});
  if(!currentUser){
    res.render("securityQuestion");
  }else{
    if(currentUser.email == useremail && currentUser.Security_Question_Answer == securityans){
      res.render("resetPassword");
    }
  }
  
});

app.get('/logout', (req,res) => {
	req.session.destroy();
    var sessionState = false;
    var username = "";

    res.render("welcome", {isLoggedIn: sessionState, userName: username});
});
  
app.get("/home", (req, res) => {
  res.render("index");
});

app.get("/profile", (req, res) => {
  res.render("profile");
});

app.get("/pickTags", (req, res) => {
  pickedTags = [];
  blacklistedTags = [];
  // These have to be strings
  var tags = ["test1", "test2"];
  res.render("pickTags" , {tags: tags});
});

app.post("/updateTags", (req, res) => {
  const tags = req.body.tags; // Array of selected tags
  const actions = req.body.actions; // Array of corresponding actions for each tag

  // TODO: Add check for whether the user already inputted a playlist
  if (typeof tags === 'undefined' || tags.length == 0) {
    // No tags were selected
    res.redirect("/confirmTags");
    return;
  }

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    const action = actions[i];

    // Handle the selected action for each tag
    if (action === "add") {
      pickedTags.push(tag); // Add the tag to the pickedTags array
    } else if (action === "blacklist") {
      blacklistedTags.push(tag); // Add the tag to the blacklistedTags array
    } else if (action === "blank") {
      // Remove the tag from both arrays, if it exists
      pickedTags = pickedTags.filter((pickedTag) => pickedTag !== tag);
      blacklistedTags = blacklistedTags.filter((blacklistedTag) => blacklistedTag !== tag);
    }
  }

  // Redirect back to the /pickTags page or any other desired page
  res.redirect("/confirmTags");
});
  
app.get("/confirmTags", (req, res) => {
  res.render("confirmTags", {pickedTags: pickedTags, blacklistedTags: blacklistedTags});
});

app.post("/confirmChoices", async (req, res) => {
  res.redirect("/results");
});

app.get("/results", (req, res) => {
  res.render("results");
});

app.get("/addMusic", (req, res) => {
  res.render("addMusic");
});

app.post("/editUsername", async (req, res) => {
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

  await userCollection.updateOne({username: req.session.username}, {$set: {username: username}});
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
