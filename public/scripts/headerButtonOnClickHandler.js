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