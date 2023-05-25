const tf = require("@tensorflow/tfjs")
const csv = require('csv-parser');
const fs = require('fs');

class AI {

    compile(){
        const model = tf.sequential();

        model.add(tf.layers.dense({
            units: 16,
            activation: 'relu',
            inputShape: [11]
        }))

        model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
        }))

        model.compile({
            loss: 'meanSquaredError',
            optimizer: 'sgd'
        })

        return model
    }

    run(){
        const cssvfilepath = './song_details.csv'
        const model = this.compile()
        const input = tf.tensor2d([
            fs.createReadStream(cssvfilepath)
      .pipe(csv())
      .on('data', (row) => {
        // uniqueTrackIds.add(trackId);

        // const featureValues = [
          parseFloat(row.danceability),
          parseFloat(row.energy),
          parseFloat(row.key),
          parseFloat(row.loudness),
          parseFloat(row.mode),
          parseFloat(row.speechiness),
          parseFloat(row.acousticness),
          parseFloat(row.instrumentalness),
          parseFloat(row.liveness),
          parseFloat(row.valence),
          parseFloat(row.tempo)
    })
        ], [2597,11])

        const output = tf.tensor2d([
            fs.createReadStream(cssvfilepath)
            .pipe(csv())
            .on('data', (row) => {
                row.track_id;
            })
        ], [2597])

        model.fit(input, output, {
            epochs: 5
        }).then(() => {
            const data = tf.tensor2d([
                [  0.7, 0.8, 2, -6.2, 1, 0.05, 0.2, 0.1, 0.3, 0.6, 120]
            ])

            const predictions = model.predict(data)
            predictions.print()
        })
    
    }
}

const ai = new AI()
ai.run()