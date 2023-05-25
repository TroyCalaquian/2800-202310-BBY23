console.log("spotifyJS.js loaded");

function handleFormSubmit(event) {
  event.preventDefault();
  
  // Template to ensure proper input
  const spotifyPlaylistRegex = /^https?:\/\/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)$/;

  // Get value from user input
  const playlistURL = document.getElementById('playlistURL').value;
  const match = playlistURL.match(spotifyPlaylistRegex);

  // Check user input vs template
  if (spotifyPlaylistRegex.test(playlistURL)) {
    // Get data from verified URL
    const playlistID = match[1];
    console.log('Playlist URL:', playlistURL);
    console.log('Playlist ID:', playlistID);

    // Send ID to URL
    const url = new URL(window.location.href);
    url.searchParams.set('playlistID', playlistID);
    window.history.replaceState({}, '', url);

    // Refresh to print playlist
    window.location.reload();
  } else {
    // Error: Invalid URL
    console.log('Invalid Spotify playlist URL:', playlistURL);
  }
}
