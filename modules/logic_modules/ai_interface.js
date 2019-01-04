var clib = require("./coord_lib.js")
var binary = require("./to_binary.js")
var default_stats =  require("./types.js").default_stats

function deep_copy(o){
    return JSON.parse(JSON.stringify(o))
}
function generate_better_pairs(record){
    var game_state = {}
    process_instruction(game_state,record[0])
    var pairs = []
    for(var i = 1; i < record.length; i++){
        var prev_game_state = deep_copy(game_state);
        process_instruction(game_state,record[i])
        pairs.push([prev_game_state,deep_copy(game_state)])
    }
    return pairs
}
function sample_prob_array(parr){

}
function make_tactics_ai(){

}
function major_coord(instr){
    switch(instr.type){
        case "MOVE": return instr.start_coord;
        case "ATTACK": return instr.source_coord;
        case "BUILD": return instr.coord;
        case "BUY_UNIT": return instr.building_coord;
        case "END_TURN": return null;
        case "BUY_ATTACHMENT": return instr.building_coord;
        case "GAME_STARTED": return null;
    }
}
function make_map_with_single_set(game_size,coord){
    var res = new Array(game_size.ysize)
    for(var y = 0; y < game_size.ysize; y++){
        res[y] = (new Float32Array(game_size.xsize))
    }
    res[coord.y][coord.x] = 1.0
    return res
}
function extract_train_vectors(records,myplayer_name){
    var all_train_inputs = []
    var all_train_outputs = []
    records.forEach(function(record){
        var first_instr = record[0]
        var cmapper = new binary.CoordMapper(first_instr.stats,first_instr.player_order,myplayer_name)
        var game_state = {}
        record.forEach(function(instr){
            if(game_state.players && game_state.players.active_player === myplayer_name){
                var main_coord = major_coord(instr)
                if(main_coord){
                    all_train_outputs.push(make_map_with_single_set(first_instr.game_size, main_coord))
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
function randInt(max){
    return Math.floor(Math.random() * max)
}
/*function get_batch(lists,batch_size){
    var res_lists = (new Array(lists.length))
    var list_size = lists[0].length
    for(var i = 0; i < res_lists; i++){
        if(list_size !== lists[i].length){
            alert("input is bad!")
        }
        res_lists[i] = new Array(batch_size)
    }
    for(var i = 0; i < batch_size; i++){
        var choice = randInt(list_size)
        for(var j = 0; j < lists.length; j++){
            res_lists[j][i] = lists[j][choice]
        }
    }
    return res_lists
}*/
class MainCoordLearner {
    constructor(game_size) {
        //tf.setBackend("cpu")
        var model = tf.sequential();
        var channel_size = binary.num_idxs_generated(default_stats)
        var lay1size = 32;
        var lay2size = 32;
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
            activation: "sigmoid",
            useBias: true,
            kernelInitializer: 'VarianceScaling',
        }))
        model.add(tf.layers.flatten())
        const optimizer = tf.train.adam()
        model.compile({
          optimizer: optimizer,
          loss: tf.losses.sigmoidCrossEntropy,
         // metrics: ['accuracy'],
        });
        this.model = model
    }
    get_prob_map(game_state,myplayer,callback) {
        var bin_map = binary.map_to_vec(game_state,myplayer)
        var input = tf.tensor4d([bin_map])
        var outarrray = this.model.predict(input)
        outarrray.data().then(function(result) {
          console.log("model infered!"); // "Stuff worked!"
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
        var batch_size = 16;
        var input_tensor = tf.tensor4d(inputs)
        var outputs_tensor = tf.tensor3d(outputs)
        var flat_outs_tensor = tf.layers.flatten().apply(outputs_tensor)//tf.reshape(outputs_tensor,[outputs.length,outputs[0].length*outputs[0][0].length])
        var model_result = this.model.fit(
            input_tensor,
            flat_outs_tensor,
            {
                batchSize: batch_size,
                epochs: 5,
                shuffle: true,
            }
        )
        model_result.then(function(result) {
          console.log("model fitted!"); // "Stuff worked!"
          finished_callback();
        }, function(err) {
          console.log("model failed!"); // Error: "It broke"
          console.log(err);
        });
        /*for(var i = 0; i < num_batches; i++){
            var batch = get_batch([inputs,outputs],batch_size)
            var input_tensor = tf.tensor4d(batch[0])
            var outputs_tensor = tf.tensor3d(batch[1])
            var flat_outs_tensor = tf.reshape(outputs_tensor,[outputs.length*outputs[0].length*outputs[0][0].length])
            var model_result = this.model.fit(
                input_tensor,
                flat_outs_tensor,
                {
                    batchSize: batch_size,
                    epochs: 1,
                }
            )
            model_result.then(function(result) {
              console.log("model fitted!"); // "Stuff worked!"
            }, function(err) {
              console.log("model failed!"); // Error: "It broke"
            });
        }*/
    }
}
/*class TacticsAI {
    constructor(all_current_weights){
        this.weights = all_current_weights
    }
    best_coord_offset_probs(game_state,coord,move_type){

    }
    best_move_main_coord_probabilty(game_state){

    }
    train_assuming_best_moves(records){

    }
}*/
function sample_main_coord_prob_map(prob_map){

}
function get_best_move(game_state){

}
module.exports = {
    //train_assuming_best_moves: train_assuming_best_moves,
    //get_best_move: get_best_move,
    MainCoordLearner: MainCoordLearner,
}
