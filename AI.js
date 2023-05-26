const { spawn } = require('child_process');
const { resolve } = require('path');

// Define the Python script file path
const pythonFilePath = 'AIPython.py';


async function runpyfile(inputfile) {
  return new Promise((resolve, reject) => {
    // let songarray = [];
    let songRecommendationsString = '';
    const pythonProcess = spawn('python', [pythonFilePath, inputfile]);

    pythonProcess.stdout.on('data', (data) => {
      songarray = `${data}`.trim().split('\n');
      songRecommendationsString = `${data}`.trim();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python: ${data}`);
      reject(data);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      // resolve(songarray);
      resolve(songRecommendationsString);
    });
  });
}


module.exports = { runpyfile }