const { spawn } = require('child_process');
const { resolve } = require('path');

// Define the Python script file path
const pythonFilePath = 'AIPython.py';


async function runpyfile(inputfile) {
  return new Promise((resolve, reject) => {
    var song_ID;
    const pythonProcess = spawn('python', [pythonFilePath, inputfile]);

    pythonProcess.stdout.on('data', (data) => {
      song_ID = `${data}`;
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python: ${data}`);
      reject(data);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      resolve(song_ID);
    });
  });
}


module.exports = { runpyfile }