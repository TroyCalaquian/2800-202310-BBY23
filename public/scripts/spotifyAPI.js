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

async function getAccessToken() {
    if (!spotifyAPI.getAccessToken()) {
      const sData = await spotifyAPI.clientCredentialsGrant();
      const accessToken = sData.body['access_token'];
      spotifyAPI.setAccessToken(accessToken);
    }
  }

async function getTracksFromPlayList(playlistId) {
  try {
    const response = await spotifyAPI.getPlaylistTracks(playlistId);
    const tracks = response.body.items;

    const songsArray = []; // Create an empty array to store the entries

    // const songArtists = "";
    tracks.forEach((track, index) => {
      const { name, artists, external_urls } = track.track;
      const songUrlLocal = external_urls.spotify;

      const artistNamesL = artists.map(artist => artist.name).join(', ');
      var jsonParsed = {songName: name, artists: artistNamesL, songURL: songUrlLocal, imageURL: "https://dummyimage.com/500x500/000/fff&text=Record+Image" };
      songsArray.push(jsonParsed); // Save each entry to the result array
    });

    return songsArray;
  } catch (error) {
    console.error('Error printing playlist songs:', error);
  }
}

const fs = require('fs');

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
  // Store data scraped from Spotify in a JSON object
//   console.log("Stringify extractedData: " + JSON.stringify(extractedData, null, 2));

  // Generate CSV string
  const csvString = Object.values(extractedData).join(',') + '\n';

  // Save CSV string to a file
  // fs.appendFileSync('song_details.csv', csvString, 'utf8');

  console.log('Data saved to song_details.csv');
};

async function getTracks() {
  let limit = 50
  let  offset = 10
  let ids = ''
  spotifyAPI.searchTracks('genre:hip-hop', {limit, offset})
  .then(function(data) {
    for(i =0; i <  data.body.tracks.items.length; i++){ 
       ids += data.body.tracks.items[i].id + '\n' 
      //  var csvString = Object.values(ids) + '\n'
      //  console.log('Search by "Hip-hop"', ids);
    }
    // fs.appendFileSync('song_id.csv', ids, 'utf-8');
  }, function(err) {
    console.error(err);
  });

  // let ids = ''
  // spotifyAPI.searchTracks('genre:hip-hop', {limit, offset})
  // .then(function(data) {
  //   for(i =0; i <  data.body.tracks.items.length; i++){
  //      ids += data.body.tracks.items[i].id + '\n'
  //     //  var csvString = Object.values(ids) + '\n'
  //     //  console.log('Search by "Hip-hop"', ids);
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

//   const trackIds = [];

//   while (offset < total) {
//     const data = await spotifyAPI.searchTracks(`genre:${genre}`, { limit, offset });
//     const tracks = data.body.tracks;

//     total = tracks.total;
//     offset += limit;

//     for (const track of tracks.items) {
//       trackIds.push(track.id);
//     }
//   }

//   return trackIds;
// }

// Usage example
// async function main() {
//   await getAccessToken();

//   const genre = 'hip-hop';
//   const trackIds = await searchTracksByGenre(genre);

//   console.log("yes seirrr" + trackIds);
// }

// Export the functions or the entire Spotify API module
module.exports = { getTracks, getSongDetails, getTracksFromPlayList, spotifyAPI, getAccessToken };
