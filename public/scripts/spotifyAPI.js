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
      var jsonParsed = {songName: name, artists: artistNamesL, songURL: songUrlLocal};
      songsArray.push(jsonParsed); // Save each entry to the result array
    });

    return songsArray;
  } catch (error) {
    console.error('Error printing playlist songs:', error);
  }
}

async function getSongDetails(songCode) {
  const response = await spotifyAPI.getAudioFeaturesForTrack(songCode);
  const audioFeatures = response.body;

  const trackInfo = await spotifyAPI.getTrack(songCode);
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
  // Store data scraped from Spotify in a JSON object
  console.log("Stringify extractedData: " + JSON.stringify(extractedData, null, 2));
};

// Export the functions or the entire Spotify API module
module.exports = { getSongDetails, getTracksFromPlayList, spotifyAPI, getAccessToken };