// Require any necessary modules
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();
const fs = require('fs');
const util = require('util');
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
    const sData = await spotifyAPI.clientCredentialsGrant();
    const accessToken = sData.body['access_token'];
    spotifyAPI.setAccessToken(accessToken);
  }
}

// Gets displayable data from song ID's in an array.
async function getTracksFromSongIDs(songIdArray) {
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
  await getAccessToken();
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
  await getAccessToken();
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
    'danceability',
    'energy',
    'key',
    'loudness',
    'mode',
    'speechiness',
    'acousticness',
    'instrumentalness',
    'liveness',
    'valence',
    'tempo',
  ];

  extractedData.push(headers.join(',')); // Add header row

  for (const songID of songIDArray) {
    const response = await spotifyAPI.getAudioFeaturesForTrack(songID);
    const audioFeatures = response.body;

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

    extractedData.push(songData.join(',')); // Add song data row
  }

  saveToFile(extractedData.join('\n'));

  return extractedData;
}

// Save data to a file
function saveToFile(data) {
  fs.writeFile('./inputtest.csv', data, { flag: 'w' }, function(err) {
    if (err) {
      console.error('Error saving data to file:', err);
    } else {
      console.log('Data saved to file successfully.');
    }
  });
}






// Parses and sets detailed info of given song to CSV file.
async function printSongDetailsToCSV(songCode) {
  await getAccessToken();

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

  // Generate CSV string
  const csvString = Object.values(extractedData).join(',') + '\n';

  // Save CSV string to a file
  fs.appendFileSync('song_details.csv', csvString, 'utf8');
};




// Usage example
async function main() {
  await getAccessToken();

  // const genre = 'hip-hop';
  // const trackIds = await searchTracksByGenre(genre);

  // console.log("yes seirrr" + trackIds);
  getTracks()
}


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
      printSongDetailsToCSV(songID)
    }, delay);
    delay += 1500; // 30-second delay
  }
}
const csvFilePath = 'C:\\Users\\MaxwellV\\Desktop\\song_id.csv';
// readCSV(csvFilePath);


const readFile = util.promisify(fs.readFile);

async function getRandomSongIDs() {
  try {
    await getAccessToken();
    const songIDs = await readFile('./song_id.csv', 'utf8');
    const parsedData = songIDs
      .trim() // Remove leading/trailing whitespace
      .split('\n'); // Split the string into an array of lines

    const randomSongIDs = [];
    const totalSongs = parsedData.length;

    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * totalSongs);
      const randomSongID = parsedData[randomIndex];
      randomSongIDs.push(randomSongID);
    }

    // console.log(randomSongIDs);
    return randomSongIDs;
  } catch (error) {
    console.error('Error reading song ID file:', error);
    return [];
  }
}


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
module.exports = { getAccessToken, getTracksFromSongIDs, getTracksFromPlayList, getPlaylistName, parseUserInput, getTracks, getRandomSongIDs };

