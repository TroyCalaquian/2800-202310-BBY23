const { spawn } = require('child_process');

// Define the Python script file path
const pythonFilePath = 'AIPython.py';
var inputfile = './inputtest.csv'

// Spawn a child process to execute the Python file
const pythonProcess = spawn('python', [pythonFilePath, inputfile]);

// Listen for output from the Python process
pythonProcess.stdout.on('data', (data) => {
  console.log(`Received data from Python: ${data}`);
});

// Listen for errors from the Python process
pythonProcess.stderr.on('data', (data) => {
  console.error(`Error from Python: ${data}`);
});

// Handle the exit event of the Python process
pythonProcess.on('close', (code) => {
  console.log(`Python process exited with code ${code}`);
});