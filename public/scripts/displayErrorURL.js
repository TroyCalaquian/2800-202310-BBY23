console.log("displayErrorURL.js Loaded");

function overrideHeader() {
    // Copy URL
    var urlPath = window.location.pathname;
    var urlParts = urlPath.split('/');
    
    // Get error from URL
    var erroneousInput = urlParts[urlParts.length - 1];
    
    // Test. Prints to log
    console.log("Bad Input: " + erroneousInput);

    // Get span by ID
    var badInput = document.getElementById("badInput");
    
    // Override html found earlier
    badInput.innerHTML = erroneousInput;
} overrideHeader();