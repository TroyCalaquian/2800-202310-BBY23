console.log("headerButtonOnClick.js loaded");

var currentClickedButton = undefined;
const currentURL = window.location.href;
const parts = currentURL.split("/");
let afterSlash = parts[parts.length - 1];

if (currentClickedButton){
currentClickedButton.classList.remove("active-button");
}
switch (afterSlash){
  case "addMusic": afterSlash = "add";
  break; 
  case "pickTags": afterSlash = "add";
  break; 
  case "confirmTags": afterSlash = "add";
  break; 
  case "results": afterSlash = "add";
  break; 
  case "welcome": afterSlash = "home";
  break; 
  case "inputSong": afterSlash = "add";
  break; 
  default: break;
}
if (afterSlash == "profile" || afterSlash == "home" || afterSlash == "addMusic" || afterSlash == "login" || afterSlash == "signup" 
|| afterSlash == "pickTags" || afterSlash == "confirmTags" || afterSlash == "add"){
  currentClickedButton = document.getElementById(afterSlash+"Button");
  currentClickedButton.classList.add("active-button");
}

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
    window.location.href = "/inputSong";

}
document.getElementById("addButton").onclick = addClicked;

document.addEventListener("DOMContentLoaded", function() {
    var logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", function() {
        window.location.href = "/logout";
      });
    }
  });
  
document.addEventListener("DOMContentLoaded", function() {
    var loginButton = document.getElementById("loginButton");
    if (loginButton) {
      loginButton.addEventListener("click", function() {
        window.location.href = "/login";
      });
    }
  });

  document.addEventListener("DOMContentLoaded", function() {
    var signupButton = document.getElementById("signupButton");
    if (signupButton) {
      signupButton.addEventListener("click", function() {
        window.location.href = "/signup";
      });
    }
  });