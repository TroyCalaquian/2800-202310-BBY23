console.log("headerButtonOnClick.js loaded");

function logoClicked(){
    window.location.href = "/home";
}
document.getElementById("logoButton").onclick = logoClicked;

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

function logoutClicked() {
    window.location.href = "/logout";
}
document.getElementById("logoutButton").onclick = logoutClicked;