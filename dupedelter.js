const fs = require('fs');
const filePath = 'song_id.csv';

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  // Split the data into lines
  const lines = data.split('\n');

  // Create a Set to store unique records
  const uniqueRecords = new Set();

  // Add each record to the Set
  lines.forEach((line) => {
    uniqueRecords.add(line);
  });

  // Join the unique records into a single string
  const uniqueData = [...uniqueRecords].join('\n');

  // Write the unique data back to the file
  fs.writeFile(filePath, uniqueData, 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Duplicates removed successfully!');
  });
});
