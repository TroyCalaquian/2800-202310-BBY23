const fs = require('fs');
const csv = require('csv-parser');
// const { data } = require('@tensorflow/tfjs');

// const csvFilePath = './song_details.csv'

 function read(){
   fs.readFile('./song_details.csv', (err, data) => {
        if (err) throw err;
        console.log(data.track_id);})
    // console.log(result) 
}

read()