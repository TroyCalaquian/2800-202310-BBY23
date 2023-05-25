console.log("userInput.js loaded");

const songIDArray = [];

function isValidSpotifyURL(url) {
  // Regular expression pattern to match Spotify song URLs
  const spotifyURLPattern = /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/;

  return spotifyURLPattern.test(url);
}

document.getElementById('urlForm').addEventListener('submit', function(event) {
  console.log("Submit clicked");
  event.preventDefault();
  const urlInput = document.getElementById('url');
  const url = urlInput.value;
  const isValid = isValidSpotifyURL(url);
  console.log(`URL: ${url}`);
  console.log(`Valid: ${isValid}`);

  // Add the song ID to the list if it is valid
  if (isValid) {
    const songID = url.split('/').pop();
    const urlParams = new URLSearchParams(window.location.search);
    const addedSongs = urlParams.getAll('addedSongs');
    addedSongs.push(songID);

    urlParams.set('addedSongs', addedSongs);

    const newURL = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newURL);
  }
  urlInput.value = '';
  window.location.reload();
});

function sendToAI() {
  const urlParams = new URLSearchParams(window.location.search);
  const addedSongs = urlParams.getAll('addedSongs');

  // Check if there are added songs in the URL
  if (addedSongs.length > 0) {
    const url = `/aiData?addedSongs=${addedSongs.join(',')}`;
    window.location.href = url;
  } else {
    // Handle the case when no songs are added
    console.log("No songs added to the URL");
  }
}
