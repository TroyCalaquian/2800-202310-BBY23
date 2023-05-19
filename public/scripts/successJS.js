console.log("successJS.js loaded");

const toggleButton = document.getElementById('toggleButton');
const contentDiv = document.getElementById('cardDisplay');

function toggleVisibility() {
  console.log("toggleVisibility called");
  var div = document.getElementById('myDiv');
  var children = div.children;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    if (child.style.display === 'none') {
      child.style.display = 'block';
    } else {
      child.style.display = 'none';
    }
  }
}



  
  