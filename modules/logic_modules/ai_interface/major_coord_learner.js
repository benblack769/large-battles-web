var clib = require("../coord_lib.js")
var binary = require("./to_binary.js")
var ai_utils = require("./ai_utils.js")
var type_utils = require("./type_utils.js")
var default_stats =  require("../types.js").default_stats

function extract_train_vectors(records,myplayer_name){
    var all_train_inputs = []
    var all_train_outputs = []
    records.forEach(function(record){
        var first_instr = record[0]
        var cmapper = new binary.CoordMapper(first_instr.stats,first_instr.player_order,myplayer_name)
        var game_state = {}
        record.forEach(function(instr){
            if(game_state.players && game_state.players.active_player === myplayer_name){
                var main_coord = type_utils.major_coord(instr)
                if(main_coord){
                    all_train_outputs.push(ai_utils.make_map_with_single_set(first_instr.game_size, main_coord))
                    all_train_inputs.push(cmapper.map_to_vec(game_state.map))
                }
            }
            clib.process_instruction(game_state,instr)
        })
    })

    return {
        inputs: all_train_inputs,
        outputs: all_train_outputs,
    }
}

function my_loss_fn(labels,predictions){
    var sig_preds = tf.sigmoid(predictions)
    var weights = tf.abs(tf.sub(sig_preds,labels))
    var costs = tf.losses.sigmoidCrossEntropy(labels,predictions,weights,0,tf.Reduction.SUM)
    return costs
}

class MainCoordLearner {
    constructor(game_size) {
        //tf.setBackend("cpu")
        var model = tf.sequential();
        var channel_size = binary.num_idxs_generated(default_stats)
        var lay1size = 16;
        var lay2size = 16;
        var lay3size = 1;
        model.add(tf.layers.conv2d({
            filters: lay1size,
            kernelSize: 3,
            activation: "relu",
            padding: "same",
            strides: 1,
            useBias: true,
            kernelInitializer: 'VarianceScaling',
            inputShape: [game_size.ysize,game_size.xsize,channel_size],
        }))
        model.add(tf.layers.conv2d({
            filters: lay2size,
            kernelSize: 3,
            padding: "same",
            strides: 1,
            activation: "relu",
            useBias: true,
            kernelInitializer: 'VarianceScaling',
        }))
        model.add(tf.layers.conv2d({
            filters: lay3size,
            kernelSize: 1,
            padding: "same",
            strides: 1,
            //activation: "sigmoid",
            useBias: true,
            kernelInitializer: 'VarianceScaling',
        }))
        model.add(new (ai_utils.ScalarMult)(0.1))
        //model.add(new ScalarAdd(-5))
        //model.add(tf.layers.activation({activation: 'sigmoid'}))
        //model.add(tf.layers.flatten())
        const optimizer = tf.train.rmsprop(0.01);
        model.compile({
          optimizer: optimizer,
          loss: my_loss_fn,
          metrics: ['accuracy'],
        });
        this.model = model
    }
    get_prob_map(game_state,myplayer,callback) {
        var bin_map = binary.map_to_vec(game_state,myplayer)
        var input = tf.tensor4d([bin_map])
        var outarrray = tf.sigmoid(this.model.predict(input))
        outarrray.data().then(function(result) {
          console.log("model infered!"); // "Stuff worked!"
          console.log(result)
          console.log(Math.max.apply(null,result))
          callback(result);
        }, function(err) {
          console.log("model failed!"); // Error: "It broke"
          console.log(err);
        });
    }
    train_on(records,myplayer_name,finished_callback){
        var ins_outs = extract_train_vectors(records,myplayer_name)
        this.train_assuming_best(ins_outs.inputs,ins_outs.outputs,finished_callback)
    }
    train_assuming_best(inputs,outputs,finished_callback) {
        var num_batches = 100;
        var batch_size = 8;
        var input_tensor = tf.tensor4d(ai_utils.flatten(inputs),[inputs.length,inputs[0].length,inputs[0][0].length,inputs[0][0][0].length])
        var outputs_tensor = tf.tensor3d(outputs)
        var flat_outs_tensor = tf.reshape(outputs_tensor,[outputs.length,outputs[0].length,outputs[0][0].length,1])//t
        //var flat_outs_tensor = tf.layers.flatten().apply(outputs_tensor)//tf.reshape(outputs_tensor,[outputs.length,outputs[0].length*outputs[0][0].length])
        var model_result = this.model.fit(
            input_tensor,
            flat_outs_tensor,
            {
                batchSize: batch_size,
                epochs: 10,
                shuffle: true,
                //verbose: true,
                //validationSplit: 0.2,
            }
        )
        model_result.then(function(result) {
          console.log("model fitted!"); // "Stuff worked!"
          finished_callback();
        }, function(err) {
            alert("training failed!")
          console.log("model failed!"); // Error: "It broke"
          console.log(err);
        });
    }
}
module.exports = {
    MainCoordLearner: MainCoordLearner,
}
