const fs = require('fs');

const filePath = 'song_details.csv';

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Split the data into lines
  const lines = data.split('\n');

  // Remove the trailing comma from each line
  const modifiedLines = lines.map((line) => line.replace(/,\s*$/, ''));

  // Join the modified lines back into a single string
  const modifiedData = modifiedLines.join('\n');

  // Write the modified data back to the file
  fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Extra comma removed successfully!');
  });
});
