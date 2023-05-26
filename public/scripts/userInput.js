console.log("userInput.js loaded");

// Define inputArray in the global scope
const inputArray = [];

function isValidSpotifyURL(url) {
  // Regular expression pattern to match Spotify song URLs
  const spotifyURLPattern = /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/;

  return spotifyURLPattern.test(url);
}

function deleteAllEntries() {
  const cardContainer = document.querySelector('.card-container');
  cardContainer.innerHTML = '';

  const urlParams = new URLSearchParams(window.location.search);
  urlParams.delete('addedSongs');
  const newURL = `${window.location.pathname}?${urlParams.toString()}`;
  window.history.replaceState(null, null, newURL);
}

// Add an event listener to the "Delete All Entries" button
const deleteAllButton = document.querySelector('.delete-all-button');
deleteAllButton.addEventListener('click', deleteAllEntries);





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


// console.log("userInput.js loaded");

// const songIDArray = [];

// function isValidSpotifyURL(url) {
//   // Regular expression pattern to match Spotify song URLs
//   const spotifyURLPattern = /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+$/;

//   return spotifyURLPattern.test(url);
// }

// // Move the deleteEntry function inside the scope where inputArray is defined
// function deleteEntry(index) {
//   // Convert the index to a number (optional)
//   index = parseInt(index);

//   // Get the card container element
//   const cardContainer = document.querySelector('.card-container');

//   // Get the list of card elements
//   const cards = cardContainer.querySelectorAll('.card');

//   // Check if the index is within the valid range
//   if (index >= 0 && index < cards.length) {
//     // Remove the card element from the DOM
//     const cardToRemove = cards[index];
//     cardToRemove.parentNode.removeChild(cardToRemove);

//     // Remove the corresponding entry from inputArray
//     inputArray.splice(index, 1);

//     // Update the URL to reflect the changes
//     const songIds = inputArray.map(entry => entry.songId).join(',');
//     const url = '/aiData?addedSongs=' + songIds;
//     window.history.replaceState(null, null, url);
//   }
// }

// // Add an event listener to the document that listens for clicks on the delete buttons
// document.addEventListener('click', function(event) {
//   if (event.target.matches('.delete-button')) {
//     const index = event.target.getAttribute('data-index');
//     deleteEntry(index);
//   }
// });






// document.getElementById('urlForm').addEventListener('submit', function(event) {
//   console.log("Submit clicked");
//   event.preventDefault();
//   const urlInput = document.getElementById('url');
//   const url = urlInput.value;
//   const isValid = isValidSpotifyURL(url);
//   console.log(`URL: ${url}`);
//   console.log(`Valid: ${isValid}`);

//   // Add the song ID to the list if it is valid
//   if (isValid) {
//     const songID = url.split('/').pop();
//     const urlParams = new URLSearchParams(window.location.search);
//     const addedSongs = urlParams.getAll('addedSongs');
//     addedSongs.push(songID);

//     urlParams.set('addedSongs', addedSongs);

//     const newURL = `${window.location.pathname}?${urlParams.toString()}`;
//     window.history.replaceState({}, '', newURL);
//   }
//   urlInput.value = '';
//   window.location.reload();
// });

// function sendToAI() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const addedSongs = urlParams.getAll('addedSongs');

//   // Check if there are added songs in the URL
//   if (addedSongs.length > 0) {
//     const url = `/aiData?addedSongs=${addedSongs.join(',')}`;
//     window.location.href = url;
//   } else {
//     // Handle the case when no songs are added
//     console.log("No songs added to the URL");
//   }
// }
