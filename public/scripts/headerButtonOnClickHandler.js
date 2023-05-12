console.log("headerButtonOnClick.js loaded");

function profileClicked() {
    window.location.href = "/profile";
}
document.getElementById("profileButton").onclick = profileClicked;

function homeClicked() {
    window.location.href = "/home";
}
document.getElementById("homeButton").onclick = homeClicked;

function addClicked() {
    window.location.href = "/addMusic";
}
document.getElementById("addButton").onclick = addClicked;