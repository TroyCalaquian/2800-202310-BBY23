const indexData = require("./../../index.js");
const spotifyUtils = require("./spotifyUtils.js");

const testVar = "testing123Access";

async function printPlaylistSongs(playlistId) {
  console.log(spotifyUtils.track);

  console.log("printPlaylistSongs called");
  try {
    const response = await spotifyApi.getPlaylistTracks(playlistId);
    const tracks = response.body.items;
    
    console.log(`Songs in Playlist (${playlistId}):`);
    tracks.forEach((track, index) => {
      const { name, artists } = track.track;
      const artistNames = artists.map(artist => artist.name).join(', ');
      console.log(`${index + 1}. ${name} - ${artistNames}`);
    });
  } catch (error) {
    console.error('Error printing playlist songs:', error);
  }
}

module.exports = {
  testVar
}