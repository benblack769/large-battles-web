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

class StateComparitor {
    constructor(game_size) {
        //tf.setBackend("cpu")
        var channel_size = binary.num_idxs_generated(default_stats)*2
        var lay1size = 16;
        var lay2size = 16;
        var lay3size = 1;
        var input = tf.input({shape:[game_size.ysize,game_size.xsize,channel_size]});
        var sum_layer1 = tf.layers.dense({
            useBias: true,
            activation: "relu",
            units: 12,
            kernelInitializer: 'randomNormal',
        }).apply(input)
        var sum_layer2 = tf.layers.dense({
            useBias: true,
            activation: "relu",
            units: 12,
            kernelInitializer: 'randomNormal',
        }).apply(sum_layer1)
        var sum_layer_sum = sum_layer2.sum()
        //model.add(new ai_utils.ScalarMult(0.1))
        //model.add(new ScalarAdd(-5))
        //model.add(tf.layers.activation({activation: 'sigmoid'}))
        //model.add(tf.layers.flatten())
        var model = tf.model({
            inputs: input,
            outputs: sum_layer_sum,
        });
        const optimizer = tf.train.rmsprop(0.01);
        model.compile({
          optimizer: optimizer,
          loss: tf.losses.sigmoidCrossEntropy,
          //metrics: ['accuracy'],
        });
        this.model = model
    }
    get_better_prob(game_state1,game_state2,myplayer,callback) {
        var bin_map1 = binary.map_to_vec(game_state1,myplayer)
        var bin_map2 = binary.map_to_vec(game_state2,myplayer)
        var tensor_shape = [1,bin_map1.length,bin_map1[0].length,bin_map1[0][0].length]
        var i1 = tf.tensor4d(ai_utils.flatten(bin_map1),tensor_shape)
        var i2 = tf.tensor4d(ai_utils.flatten(bin_map2),tensor_shape)
        var input = tf.concat([i1,i2])
        var outarrray = tf.sigmoid(this.model.predict(input))
        outarrray.data().then(function(result) {
          console.log("model infered!"); // "Stuff worked!"
          console.log(result)
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
        var outputs_tensor = tf.tensor1d(outputs)
        var model_result = this.model.fit(
            input_tensor,
            outputs_tensor,
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
    StateComparitor: StateComparitor,
}
