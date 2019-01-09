var clib = require("./coord_lib.js")
var binary = require("./to_binary.js")
var wrap_fns = require("./wrap_fns.js")
var default_stats =  require("./types.js").default_stats

function deep_copy(o){
    return JSON.parse(JSON.stringify(o))
}
function sample_prob_array(parr){

}
function make_tactics_ai(){

}
function major_coord(instr){
    switch(instr.type){
        case "MOVE": return instr.start_coord;
        case "ATTACK": return instr.source_coord;
        case "BUILD": return null;//instr.coord;
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
    //res[0][0] = 1.0
    //console.log(res)
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
                    all_train_outputs.push(main_coord)
                    all_train_inputs.push(cmapper.map_to_vec(game_state.map))
                }
            }
            clib.process_instruction(game_state,instr)
        })
    })
    console.log(all_train_inputs)

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
class ScalarMult extends tf.layers.Layer {
    constructor(scalarval){
        super({})
        this._scalar_val = tf.scalar(scalarval)
        this.supportsMasking = true;
    }
    call(inputs, kwargs) {
        let input = inputs;
        if (Array.isArray(input)) {
          input = input[0];
        }
        this.invokeCallHook(inputs, kwargs);
        return tf.mul(input,this._scalar_val)
    }
    getClassName() {
        return 'ScalarMult';
    }
}

class ScalarAdd extends tf.layers.Layer {
    constructor(scalarval){
        super({})
        this._scalar_val = tf.scalar(scalarval)
        this.supportsMasking = true;
    }
    call(inputs, kwargs) {
        let input = inputs;
        if (Array.isArray(input)) {
          input = input[0];
        }
        this.invokeCallHook(inputs, kwargs);
        return tf.add(input,this._scalar_val)
    }
    getClassName() {
        return 'ScalarMult';
    }
}
function deep_equals(o1,o2){
    return JSON.stringify(o1) === JSON.stringify(o2)
}
function sample_prob_array(array){
    array.sort((a,b)=>a-b)

}
function find_train_counterexamples(binary_map,prob_map,actual_coord,num_find){

}
function swap(arr,idx1,idx2){
    var val = arr[idx1]
    arr[idx1] = arr[idx2]
    arr[idx2] = val
}
function shuffle_arrays_together(nested_data_1,nested_data_2){
    console.assert(nested_data_1.length === nested_data_2.length)
    for(var i = 0; i < nested_data_1.length; i++){
        var swap_idx = randInt(nested_data_1.length)
        swap(nested_data_1,i,swap_idx)
        swap(nested_data_2,i,swap_idx)
    }
}

class MainCoordLearner {
    constructor(game_size) {
        this.game_size = game_size
        var radius = 6
        var num_samples = 16;
        this.radius = radius
        this.num_samples = num_samples
        wrap_fns.wrap_fns()
        //tf.setBackend("cpu")
        var model = tf.sequential();
        var channel_size = binary.num_idxs_generated(default_stats)
        console.log("channel_size")
        console.log(channel_size)
        var lay1size = 8;
        var lay2size = 8;
        var lay3size = 1;
        model.add(tf.layers.conv2d({
            filters: lay1size,
            kernelSize: 1,
            activation: "relu",
            padding: "same",
            strides: 1,
            useBias: true,
            kernelInitializer: 'VarianceScaling',
            inputShape: [game_size.ysize,game_size.xsize,channel_size],
        }))
        model.add(tf.layers.conv2d({
            filters: lay2size,
            kernelSize: 1,
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
        //model.add(new ScalarMult(0.1))
        //model.add(new ScalarAdd(-5))
        model.add(tf.layers.activation({activation: 'sigmoid'}))
        //model.add(tf.layers.flatten())
        const optimizer = tf.train.rmsprop(0.01);
        model.compile({
          optimizer: optimizer,
          loss: tf.losses.sigmoidCrossEntropy,
          metrics: ['accuracy'],
        });
        this.model = model
    }
    get_prob_map(bin_map,callback) {
        //var bin_map = binary.map_to_vec(game_state,myplayer)
        var flat_bin_map = wrap_fns.flatten(bin_map)
        var input = tf.tensor4d(flat_bin_map,[1,bin_map.length,bin_map[0].length,bin_map[0][0].length])
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
        //return;
        //this.evaluate(ins_outs.inputs,ins_outs.outputs)
        this.train_assuming_best(ins_outs.inputs,ins_outs.outputs,finished_callback)
        //this.evaluate(ins_outs.inputs,ins_outs.outputs)
    }
    evaluate(inputs,outputs){
        var input_tensor = tf.tensor4d(inputs)
        var outputs_tensor = tf.tensor3d(outputs)
        var flat_outs_tensor = tf.reshape(outputs_tensor,[outputs.length,outputs[0].length,outputs[0][0].length,1])//t
        var result = this.model.evaluate(input_tensor,flat_outs_tensor,{})
        console.log(result)
        result[0].print();
        result.data().then(function(res){
            console.log(res)
        },function(){})
    }
    train_callback_eval(idx,finished_callback){
        if(idx > this.bin_maps.length){
            finished_callback()
            return;
        }
        var binmap = this.bin_maps[idx]
        var main_coord = this.move_coord_list[idx]
        var callback = (function(){
            this.train_callback_eval(idx+1,finished_callback)
        }).bind(this)
        var get_callback = (function(prob_map_array){
            var ins_outs = wrap_fns.get_sample_data(binmap,prob_map_array,main_coord,this.game_size,this.num_samples,this.radius);
            this.train_single_callback(ins_outs.inputs,ins_outs.outputs,callback)

        }).bind(this)
        this.get_prob_map(binmap,get_callback)
    }
    train_single_callback(input_t,out_t,callback){
        var model_result = this.model.fit(
            input_t,
            out_t,
            {
                batchSize: this.num_samples*2,
            }
        )
        model_result.then(callback)
    }
    train_assuming_best(bin_maps,move_coord_list,finished_callback) {
        var num_epocs = 1;
        //var batch_size = 8;
        for(var b = 0; b < num_epocs; b++){
            shuffle_arrays_together(bin_maps,move_coord_list)
            this.bin_maps = bin_maps
            this.move_coord_list = move_coord_list
            this.train_callback_eval(0,finished_callback)
            /*for(var e = 0; e < bin_maps.length; e++){
                var inputs = wrap_fns.get_sample_data(bin_maps[e],)
            }*/
        }
        /*
        var inp_shape = [inputs.length,inputs[0].length,inputs[0][0].length,inputs[0][0][0].length]
        var input_tensor = tf.tensor4d(wrap_fns.flatten(inputs),inp_shape)
        var outputs_tensor = tf.tensor3d(outputs)
        var flat_outs_tensor = tf.reshape(outputs_tensor,[outputs.length,outputs[0].length,outputs[0][0].length,1])//t
        //var flat_outs_tensor = tf.layers.flatten().apply(outputs_tensor)//tf.reshape(outputs_tensor,[outputs.length,outputs[0].length*outputs[0][0].length])
        var model_result = this.model.fit(
            input_tensor,
            flat_outs_tensor,
            {
                batchSize: batch_size,
                epochs: 10,
                //shuffle: true,
                //verbose: true,
                //validationSplit: 0.2,
            }
        )
        model_result.then(function(result) {
          console.log("model fitted!"); // "Stuff worked!"
          finished_callback();
        }, function(err) {
          console.log("model failed!"); // Error: "It broke"
          console.log(err);
      });*/
    }
}
function sample_main_coord_prob_map(prob_map){

}
function get_best_move(game_state){

}
module.exports = {
    //train_assuming_best_moves: train_assuming_best_moves,
    //get_best_move: get_best_move,
    MainCoordLearner: MainCoordLearner,
}
