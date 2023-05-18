require("dotenv").config();
const express = require("express");
const querystring = require('querystring');
const request = require('request');
const app = express();

var client_id = process.env.SPOTIFY_CLIENT_ID;
var client_secret = process.env.SPOTIFY_CLIENT_SECRET;

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

app.get('/', function(req, res) {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);
  // console.log("in /" + state)
  // console.log("in /" + stateKey)

  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: 'http://localhost:3000/callback',
      state: state
    }));
});

app.get('/refresh_token', function(req, res) {
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    } else {
      console.log('Error refreshing token:', body);
      res.send('Error refreshing token');
    }
  });
});

app.get('/callback', function(req, res) {
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;
  console.log(req.cookies[stateKey])
  console.log("damn " + state)
  console.log("damn key " + storedState)

  if (state === null || state !== storedState) {
    console.log('Invalid state parameter');
    res.redirect('/error');
  } else {
    res.clearCookie(stateKey);

    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: 'http://localhost:3000/callback',
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;

        res.redirect('/success');
      } else {
        console.log('Error getting access token:', body);
        res.redirect('/error');
      }
    });
  }
});

app.get('/success', (req, res) => {
  res.send('<h1>Success</h1>');
});

app.get('/error', (req, res) => {
  res.send('<h1>Error</h1>');
  });
  
  app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  });
