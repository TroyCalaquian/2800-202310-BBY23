// Require any necessary modules
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

// .env secrets
const spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
const spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

// Create a new instance of the SpotifyWebApi
const spotifyAPI = new SpotifyWebApi({
  clientId: spotify_client_id,
  clientSecret: spotify_client_secret,
});

// Function that calls for a API token
async function getAccessToken() {
  if (!spotifyAPI.getAccessToken()) {
    const sData = await spotifyAPI.clientCredentialsGrant();
    const accessToken = sData.body['access_token'];
    spotifyAPI.setAccessToken(accessToken);
  }
}

/** Gets the details for each song in a playlist.
 * 
 * @param {*} playlistId Playlist ID for playlist to get
 * @returns 
 */
async function getTracksFromPlayList(playlistId) {
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

async function getPlaylistName(playlistID) {
  try {
    const response = await spotifyAPI.getPlaylist(playlistID);
    const playlistName = response.body.name;
    return playlistName;
  } catch (error) {
    console.log('Error retrieving playlist name:', error);
    return null;
  }
}


async function getSongDetails(songCode) {
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
  const csvString = Object.values(extractedData).join(',') + '\n';
  // fs.appendFileSync('song_details.csv', csvString, 'utf8');
};

const fs = require('fs');
const csv = require('csv-parser');

var printAt = 0;

// function readCSVWithDelay(csvFilePath) {
//   const rows = [];
//   fs.createReadStream(csvFilePath)
//     .pipe(csv())
//     .on('data', (row) => {
//       rows.push(row);
//     })
//     .on('end', () => {
//       printRowsWithDelay(rows);
//     });
// }

// function printRowsWithDelay(rows) {
//   let delay = 0;
//   for (let i = 0; i < rows.length; i++) {
//     setTimeout(async () => {
//       await getAccessToken();
//       const songID = rows[i].song_ID; // Replace "song_ID" with the actual property name
//       console.log(songID);
//       getSongDetails(songID)
//     }, delay);
//     delay += 3000; // 30-second delay
//   }
// }
const csvFilePath = 'C:\\Users\\MaxwellV\\Desktop\\song_id.csv';
// readCSVWithDelay(csvFilePath);

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

// Search tracks by genre and retrieve the track IDs
// async function searchTracksByGenre(genre) {
//   console.log("gebnre searching")
//   const limit = 1; // Adjust the number of tracks per request as needed
//   let offset = 0;
//   let total = 1; // Start with a value that exceeds the limit
// 
//   const trackIds = [];
// 
//   while (offset < total) {
//     const data = await spotifyAPI.searchTracks(`genre:${genre}`, { limit, offset });
//     const tracks = data.body.tracks;
// 
//     total = tracks.total;
//     offset += limit;
// 
//     for (const track of tracks.items) {
//       trackIds.push(track.id);
//     }
//   }
// 
//   return trackIds;
// }
// 
// Usage example
// async function main() {
//   await getAccessToken();
// 
//   const genre = 'hip-hop';
//   const trackIds = await searchTracksByGenre(genre);
// 
//   console.log("yes seirrr" + trackIds);
// }

// Export the functions or the entire Spotify API module
module.exports = { getTracks, getSongDetails, getTracksFromPlayList, spotifyAPI, getAccessToken, getPlaylistName };
