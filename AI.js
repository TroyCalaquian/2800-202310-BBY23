// const tf = require('@tensorflow/tfjs');
// require('@tensorflow/tfjs-node');
// const csv = require('csv-parser');
// const fs = require('fs');
// const { parse } = require('path');

// // Define the model architecture
// function createModel(inputShape) {
//   const model = tf.sequential();
//   model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape }));
//   model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));
//   return model;
// }

// // Load and preprocess the data
// function loadAndPreprocessData(csvFilePath) {
//   // console.log(csvFilePath)
//   const features = [];
//   const labels = [];
//   const uniqueTrackIds = new Set();
//   const trackIdIndices = new Map(
//     [...uniqueTrackIds].map((trackId, index) => [index, trackId])
//   );
//   return new Promise((resolve, reject) => {
//     fs.createReadStream(csvFilePath)
//       .pipe(csv())
//       .on('data', (row) => {
//         const trackId = row.track_id;
//         uniqueTrackIds.add(trackId);

//         const featureValues = [
//           parseFloat(row.danceability),
//           parseFloat(row.energy),
//           parseFloat(row.key),
//           parseFloat(row.loudness),
//           parseFloat(row.mode),
//           parseFloat(row.speechiness),
//           parseFloat(row.acousticness),
//           parseFloat(row.instrumentalness),
//           parseFloat(row.liveness),
//           parseFloat(row.valence),
//           parseFloat(row.tempo),
//         ];
//         features.push(featureValues);
//         labels.push(trackId);
//       })
//       .on('end', () => {
//         const trackIdIndices = new Map(
//           [...uniqueTrackIds].map((trackId, index) => [trackId, index])
//         );

//         const encodedLabels = labels.map((trackId) => trackIdIndices.get(trackId));

//         const featureTensor = tf.tensor2d(features);
//         const labelTensor = tf.tensor1d(encodedLabels);
//         resolve({ features: featureTensor, labels: labelTensor, trackIdIndices });
//         // console.log("features" + featureTensor)
//         // console.log("lebels" + labelTensor)
//       })
//       .on('error', (error) => {
//         reject(error);
//       });
//   });
// }

// // Train the model

// async function trainModel(model, features, labels) {
//   model.compile({ optimizer: 'SGD', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

//   // const batchSize = 1000;
//   const epochs = 5;
//   // console.log(features)
//   // console.log(labels)
//   return await model.fit(features, labels, {
//     // batchSize,
//     epochs,
//     shuffle: true
//     // validationSplit: 0.2,
//     // callbacks: [tf.callbacks.TensorBoard('logs')], // Fix the callback definition
//   });
// }



// // Generate song recommendations
// function generateRecommendations(model, userPreferences , trackIdIndices) {
//   const inputTensor = tf.tensor2d([userPreferences]);
//   console.log(userPreferences)
//   const predictedProbabilities = model.predict(inputTensor).dataSync();

//   const decodedRecommendations = predictedProbabilities
//   .map((p, index) => [p, index])
//   .sort((a, b) => b[0] - a[0])
//   .map((p) => trackIdIndices.get(p[1]));

//   // Sort the predicted probabilities and return the recommended song IDs or names
//   console.log(decodedRecommendations)
//   // Example code for sorting and retrieving top recommendations:

//   const topRecommendations = decodedRecommendations.slice(0,5); // Adjust the number of recommendations as needed

//   console.log('Top Recommendations:');
//   topRecommendations.forEach((index) => {
//     console.log(`Song ID: ${index}`);
//   });
// }

// // Main function
// async function main() {
//   const csvFilePath = './song_details.csv';
//   const data = await loadAndPreprocessData(csvFilePath);
//   const trackIdIndices = data.trackIdIndices;


//   const inputShape = [11]; // Adjust the input shape based on the number of features
//   const model = createModel(inputShape);
//   // console.log(model.inboundNodes.outboundLayer)
//   await trainModel(model, data.features, data.labels);
//   console.log(data.labels)
//   // Example user preferences
//   const userPreferences = [  0.7, 0.8, 2, -6.2, 1, 0.05, 0.2, 0.1, 0.3, 0.6, 120]; // Adjust the values based on user preferences

//   generateRecommendations(model, userPreferences, trackIdIndices);
// }

// main();

// module.exports = {main}