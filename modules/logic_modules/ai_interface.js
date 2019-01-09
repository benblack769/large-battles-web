var clib = require("./coord_lib.js")
var binary = require("./to_binary.js")
var default_stats =  require("./types.js").default_stats

function deep_copy(o){
    return JSON.parse(JSON.stringify(o))
}
function sample_prob_array(parr){

}
function make_tactics_ai(){

}
function flatten_rec(build_arr,nested_array){
    if(typeof nested_array[0] === "number"){
        for(var i = 0; i < nested_array.length; i++){
            build_arr.push(nested_array[i])
        }
    }
    else{
        for(var i = 0; i < nested_array.length; i++){
            flatten_rec(build_arr,nested_array[i])
        }
    }
}
function flatten(nested_array){
    var res = []
    flatten_rec(res,nested_array)
    return new Float32Array(res)
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
                    all_train_outputs.push(make_map_with_single_set(first_instr.game_size, main_coord))
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
function my_loss_fn(labels,predictions){
    //console.log(labels)
    //console.log(predictions)
    //var sub = tf.sub(labels,predictions)
    //var rawcost = tf.mul(sub,sub)
    //var adj_cost = tf.mul(rawcost, predictions)
    //return adj_cost.sum()//()
    //labels.print()
    var sig_preds = tf.sigmoid(predictions)
    var weights = tf.add(sig_preds,labels)
    var costs = tf.losses.sigmoidCrossEntropy(labels,predictions,weights,0,tf.Reduction.SUM)
    //costs.print()
    return costs
}

class MainCoordLearner {
    constructor(game_size) {
        //tf.setBackend("cpu")
        var model = tf.sequential();
        var channel_size = binary.num_idxs_generated(default_stats)
        console.log("channel_size")
        console.log(channel_size)
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
        model.add(new ScalarMult(0.1))
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
    train_assuming_best(inputs,outputs,finished_callback) {
        var num_batches = 100;
        var batch_size = 8;
        var input_tensor = tf.tensor4d(flatten(inputs),[inputs.length,inputs[0].length,inputs[0][0].length,inputs[0][0][0].length])
        var outputs_tensor = tf.tensor3d(outputs)
        var flat_outs_tensor = tf.reshape(outputs_tensor,[outputs.length,outputs[0].length,outputs[0][0].length,1])//t
        //var flat_outs_tensor = tf.layers.flatten().apply(outputs_tensor)//tf.reshape(outputs_tensor,[outputs.length,outputs[0].length*outputs[0][0].length])
        var model_result = this.model.fit(
            input_tensor,
            flat_outs_tensor,
            {
                batchSize: batch_size,
                epochs: 20,
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
        });
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
