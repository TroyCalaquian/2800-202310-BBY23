// Require any necessary modules
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');

// .env secrets
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// Create a new instance of the SpotifyWebApi
const spotifyAPI = new SpotifyWebApi({
  clientId: spotify_client_id,
  clientSecret: spotify_client_secret,
});

// Gets access token if one doesn't already exist.
async function getAccessToken() {
  if (!spotifyAPI.getAccessToken()) {
    console.log("Token Created");
    const sData = await spotifyAPI.clientCredentialsGrant();
    const accessToken = sData.body['access_token'];
    spotifyAPI.setAccessToken(accessToken);
  } else {
    console.log("Token Existing");
  }
}

// Gets displayable data from song ID's in an array.
async function getTracksFromSongIDs(songIdArray) {
  console.log("getTracksFromSongIDs Called");
  await getAccessToken();

  try {
    const songsArray = [];
    if (songIdArray) {
      for (const songId of songIdArray) {
        // Get data from Spotify
        const response = await spotifyAPI.getTrack(songId);
        const { name, artists, external_urls, album } = response.body;

        // Get specific data points
        const songUrlLocal = external_urls.spotify;
        const artistNamesL = artists.map(artist => artist.name).join(' & ');
        const imageURLLocal = album.images.length > 0 ? album.images[0].url : "https://dummyimage.com/500x500/000/fff&text=Record+Image";

        // Store retrieved data in JSON object, then store into array
        const jsonParsed = { songID: songId, songName: name, artists: artistNamesL, songURL: songUrlLocal, imageURL: imageURLLocal };
        songsArray.push(jsonParsed);
      }
    }
    return songsArray;
  } catch (error) {
    console.error('Error retrieving song details:', error);
    throw error;
  }
}

// Gets displayable data from songs in a given playlist ID.
async function getTracksFromPlayList(playlistId) {
  console.log("getTracksFromPlayList Called");
  getAccessToken();
  try {
    const response = await spotifyAPI.getPlaylistTracks(playlistId);
    const tracks = response.body.items;

    const songsArray = []; // Create an empty array to store the entries

    tracks.forEach((track, index) => {
      const { name, artists, external_urls, album } = track.track;
      const songUrlLocal = external_urls.spotify;
      const artistNamesL = artists.map(artist => artist.name).join('& ');
    
      const imageURLLocal = album.images.length > 0 ? album.images[0].url : "https://dummyimage.com/500x500/000/fff&text=Record+Image";
      var jsonParsed = {songName: name, artists: artistNamesL, songURL: songUrlLocal, imageURL: imageURLLocal };
      songsArray.push(jsonParsed); // Save each entry to the result array
    });

    return songsArray;
  } catch (error) {
    console.error('Error printing playlist songs:', error);
  }
}

// Gets playlist name from playlist ID.
async function getPlaylistName(playlistID) {
  console.log("getPlaylistName Called");
  getAccessToken();
  try {
    const response = await spotifyAPI.getPlaylist(playlistID);
    const playlistName = response.body.name;
    return playlistName;
  } catch (error) {
    console.log('Error retrieving playlist name:', error);
    return null;
  }
}

async function parseUserInput(songIDArray) {
  await getAccessToken();

  const extractedData = [];

  const headers = [
    'Danceability',
    'Energy',
    'Key',
    'Loudness',
    'Mode',
    'Speechiness',
    'Acousticness',
    'Instrumentalness',
    'Liveness',
    'Valence',
    'Tempo',
  ];

  for (const songID of songIDArray) {
    const response = await spotifyAPI.getAudioFeaturesForTrack(songID);
    const audioFeatures = response.body;

    const csvData = [];
    csvData.push(headers.join(',')); // Add header row

    const songData = [
      audioFeatures.danceability.toString(),
      audioFeatures.energy.toString(),
      audioFeatures.key.toString(),
      audioFeatures.loudness.toString(),
      audioFeatures.mode.toString(),
      audioFeatures.speechiness.toString(),
      audioFeatures.acousticness.toString(),
      audioFeatures.instrumentalness.toString(),
      audioFeatures.liveness.toString(),
      audioFeatures.valence.toString(),
      audioFeatures.tempo.toString(),
    ];

    csvData.push(songData.join(',')); // Add song data row

    extractedData.push(csvData.join('\n')); // Push CSV data as a string
  }

  printCSVData(extractedData.join('\n\n'));
  return extractedData;
}

// Prints data 
function printCSVData(csvData) {
  console.log("\nprintCSVData Prints:");
  console.log(csvData);
}

// Parses and sets detailed info of given song to CSV file.
async function printSongDetailsToCSV(songCode) {
  console.log("getSongDetails Called");
  getAccessToken();

  const response = await spotifyAPI.getAudioFeaturesForTrack(songCode);
  const audioFeatures = response.body;

  const trackInfo = await spotifyAPI.getTrack(songCode);
  const { artists, name } = trackInfo.body;
  const artistNames = artists.map(artist => artist.name).join('&');

  const extractedData = {
    songID: songCode,
    songName: name,
    artists: artistNames,
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
  // Store data scraped from Spotify in a JSON object
  console.log("Stringify extractedData: " + JSON.stringify(extractedData, null, 2));

  // Generate CSV string
  const csvString = Object.values(extractedData).join(',') + '\n';

  // Save CSV string to a file
  fs.appendFileSync('song_details.csv', csvString, 'utf8');

  console.log('Data saved to song_details.csv\n');
};

// Prints CSV file, song_id.csv in this case
function readCSV(csvFilePath) {
  const rows = [];
  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      rows.push(row);
    })
    .on('end', () => {
      printRowsWithDelay(rows);
    });
}

// Calls printSongDetailsToCSV to print each entry of given array. Delay prevents rate limit restrictions with Spotify API.
function printRowsWithDelay(rows) {
  let delay = 0;
  for (let i = 0; i < rows.length; i++) {
    setTimeout(async () => {
      await getAccessToken();
      const songID = rows[i].song_ID; // Replace "song_ID" with the actual property name
      console.log(songID);
      printSongDetailsToCSV(songID)
    }, delay);
    delay += 1500; // 30-second delay
  }
}
const csvFilePath = 'C:\\Users\\MaxwellV\\Desktop\\song_id.csv';
// readCSV(csvFilePath);

async function getTracks() {
  // let limit = 50
  // let  offset = 10
  // let ids = ''
  // spotifyAPI.searchTracks('genre:hip-hop', {limit, offset})
  // .then(function(data) {
  //   for(i =0; i <  data.body.tracks.items.length; i++){
  //      ids += data.body.tracks.items[i].id + '\n'
  //     //  var csvString = Object.values(ids) + '\n'
  //      console.log('Search by "Hip-hop"', ids);
  //   }
  //   fs.appendFileSync('song_id.csv', ids, 'utf-8');
  // }, function(err) {
  //   console.error(err);
  // });

  // let ids = ''
  // spotifyAPI.searchTracks('genre:hip-hop', {limit, offset})
  // .then(function(data) {
  //   for(i =0; i <  data.body.tracks.items.length; i++){
  //      ids += data.body.tracks.items[i].id + '\n'
  //     //  var csvString = Object.values(ids) + '\n'
  //      console.log('Search by "Hip-hop"', ids);
  //   }
  //   // fs.appendFileSync('song_id.csv', ids, 'utf-8');
  // }, function(err) {
  //   console.error(err);
  // });
}

// Share these function in this file.
module.exports = { getAccessToken, getTracksFromSongIDs, getTracksFromPlayList, getPlaylistName, parseUserInput, getTracks };
