console.log("userInput.js loaded");

function isValidSpotifyURL(url) {
  // Regular expression pattern to match Spotify song URLs
  const spotifyURLPattern = /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/;

  return spotifyURLPattern.test(url);
}

document.getElementById('urlForm').addEventListener('submit', function(event) {
  event.preventDefault();
  const urlInput = document.getElementById('url');
  const url = urlInput.value;
  const isValid = isValidSpotifyURL(url);
  console.log(`URL: ${url}`);
  console.log(`Valid: ${isValid}`);
    
  // Add the song ID to the list if it is valid
  if (isValid) {
    const songID = url.split('/').pop();
    const inputSongIDs = document.getElementById('inputSongIDs');
    const liElement = document.createElement('li');
    liElement.textContent = songID;
    inputSongIDs.appendChild(liElement);
  }
    
  urlInput.value = '';
});

function printSongIDs() {
  const inputSongIDs = document.getElementById('inputSongIDs');
  const songIDs = inputSongIDs.getElementsByTagName('li');
  const songIDArray = [];
  
  for (let i = 0; i < songIDs.length; i++) {
    const songID = songIDs[i].textContent;
    songIDArray.push(songID);
  }
  
  const url = `/aiData?songIDs=${encodeURIComponent(JSON.stringify(songIDArray))}`;
  window.location.href = url;
}
