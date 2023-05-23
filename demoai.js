const tf = require("@tensorflow/tfjs")

class AI {

    compile(){
        const model = tf.sequential();

        model.add(tf.layers.dense({
            units: 16,
            inputShape: [11]
        }))

        model.add(tf.layers.dense({
            units: 1
        }))

        model.compile({
            loss: 'meanSquaredError',
            optimizer: 'sgd'
        })

        return model
    }

    run(){
        const model = this.compile()
        const input = tf.tensor2d([
            
        ])
    }
}