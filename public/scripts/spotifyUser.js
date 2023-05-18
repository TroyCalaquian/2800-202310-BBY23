console.log("spotifyJS.js loaded");

function handleFormSubmit(event) {
  event.preventDefault(); // Prevent the default form submission
  const spotifyPlaylistRegex = /^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+$/;
  
  // Access the form data
  const playlistURL = document.getElementById('playlistURL').value;
  const match = playlistURL.match(spotifyPlaylistRegex);
  

  if (!spotifyPlaylistRegex.test(playlistURL)) {
    console.log('Invalid Spotify playlist URL:', playlistURL);
  } else {
    const playlistID = match[1];
    console.log('Playlist URL:', playlistURL);
    console.log('Playlist ID:', playlistID);
  }
}
