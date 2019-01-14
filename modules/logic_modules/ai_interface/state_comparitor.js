var clib = require("../coord_lib.js")
var binary = require("./to_binary.js")
var ai_utils = require("./ai_utils.js")
var type_utils = require("./type_utils.js")
var default_stats =  require("../types.js").default_stats
var sample_move = require("./sample_move.js")

function copy_process_state(game_state,instr,cmapper){
    var new_state = clib.deep_copy(game_state)
    clib.process_instruction(new_state,instr)
    return cmapper.map_to_vec(new_state.map)
}
var good_state_first = true
function make_comparison_data(game_state,good_instr,bad_instr,cmapper){
    var good_bin = (copy_process_state(game_state,good_instr,cmapper))
    var bad_bin = (copy_process_state(game_state,bad_instr,cmapper))
    if(good_state_first){
        var concat = type_utils.concat_dim(good_bin,bad_bin,2)
        var output = 1
        good_state_first = false
    }
    else{
        var concat = type_utils.concat_dim(bad_bin,good_bin,2)
        var output = 0
        good_state_first = true
    }
    return {inputs:concat,outputs:output}
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
                var major_coord = type_utils.major_coord(instr)
                if(major_coord){
                    var num_to_sample = 2
                    var false_move_samples = sample_move.all_moves_given_major(game_state,major_coord,myplayer_name)
                        .filter(false_instr=>!clib.deep_equals(instr,false_instr))
                    if(false_move_samples.length){
                        if(false_move_samples.length !== num_to_sample){
                            false_move_samples = sample_move.sample_fixed_num(false_move_samples,num_to_sample)
                        }
                        var in_datas = false_move_samples
                            .map(false_instr=>make_comparison_data(game_state,instr,false_instr,cmapper))
                            .forEach(ins_outs=>{
                                all_train_outputs.push(ins_outs.outputs)
                                all_train_inputs.push(ins_outs.inputs)
                            })
                    }
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
function pow2(x){
    return 1 << x
}
function pow2_below(num){
    var pow2 = 1;
    while(pow2*2 < num){
        pow2 *= 2;
    }
    return pow2;
}
function select_on_value(instrs1,instrs2,select_results){
    var length = select_results.length
    var res = new Array(length)
    for(var i = 0; i < length; i++){
        if(select_results > 0.5){
            res[i] = instrs1[i]
        }
        else{
            res[i] = instrs2[i]
        }
    }
    return res
}
function tournament_eval(instructions,game_state,state_comparitor,cmapper,final_callback){
    if(instructions.length < 1){
        console.log('bad instructions!!!')
        final_callback(null)
        return
    }
    if(instructions.length === 1){
        final_callback(instructions[0])
        return
    }
    sample_move.shuffle(instructions)
    var base_size = pow2_below(instructions.length)
    var base_instrs = instructions.slice(0,base_size)
    var compare_instrs = instructions.slice(base_size)
    console.log("instructions")
    console.log(instructions)
    console.log(base_instrs)
    console.log(compare_instrs)
    var batch_size = compare_instrs.length;
    var compare_pairs = new Array(batch_size)
    console.assert(batch_size <= base_size)
    for(var i = 0; i < batch_size; i++){
        var base_bin = (copy_process_state(game_state,base_instrs[i],cmapper))
        var compare_bin = (copy_process_state(game_state,compare_instrs[i],cmapper))
        var concat = type_utils.concat_dim(base_bin,compare_bin,2)
        compare_pairs[i] = concat
    }
    state_comparitor.get_better_prob_batched(compare_pairs,function(result){
        console.log("tournament step finished")
        console.log(result)
        var winners = select_on_value(base_instrs,compare_instrs,result)
        var byes = base_instrs.slice(batch_size,base_size)
        var next_instrs = winners.concat(byes)
        tournament_eval(next_instrs,game_state,state_comparitor,cmapper,final_callback)
    })
}
function state_loss(labels,logits){
    var out = tf.losses.sigmoidCrossEntropy(labels,logits)
    return out
}

class GetChangedCoords extends tf.layers.Layer {
    constructor(){
        super({})
        this.supportsMasking = true;
        this.one = tf.scalar(1.0)
    }
    computeOutputShape(inputShape) {
        return [inputShape[0],inputShape[1],inputShape[2],1]
    }
    call(inputs, kwargs) {
        let input = inputs;
        if (Array.isArray(input)) {
            input = input[0];
        }
        if(inputs.length !== 2){
            console.assert("bad inputs to ZeroOutUnnecessary")
        }
        //let main_output = inputs[1];
        var shape = input.shape
        var new_shape = shape.slice()
        new_shape[3] = 2
        new_shape.push(shape[3]/2)
        this.invokeCallHook(inputs, kwargs);
        //var subbed_data = tf.reshape(input,new_shape)
        var split_data = tf.split(input,2,3)
        var subbed_data = tf.abs(tf.sub(split_data[0],split_data[1]))
        var summed_sub = tf.sum(subbed_data,3,true)
        var minned_data = tf.minimum(summed_sub,this.one)

        return minned_data
    }
    getClassName() {
        return 'ZeroOutUnnecessary';
    }
}
class StateComparitor {
    constructor(game_size) {
        //tf.setBackend("cpu")
        var channel_size = binary.num_idxs_generated(default_stats)*2
        var lay1size = 32;
        var lay2size = 32;
        var lay3size = 1;
        var input = tf.input({shape:[game_size.ysize,game_size.xsize,channel_size]});
        var sum_layer1 = tf.layers.conv2d({
            filters: lay1size,
            kernelSize: 3,
            activation: "relu",
            padding: "same",
            strides: 1,
            useBias: true,
            kernelInitializer: 'VarianceScaling',
            inputShape: [game_size.ysize,game_size.xsize,channel_size],
        }).apply(input)
        var sum_layer2 = tf.layers.conv2d({
            filters: lay1size,
            kernelSize: 3,
            activation: "relu",
            padding: "same",
            strides: 1,
            useBias: true,
            kernelInitializer: 'VarianceScaling',
        }).apply(sum_layer1)
        var sum_layer3 = tf.layers.conv2d({
            filters: lay1size,
            kernelSize: 3,
            activation: "relu",
            padding: "same",
            strides: 1,
            useBias: true,
            kernelInitializer: 'VarianceScaling',
        }).apply(sum_layer1)

        var final_layer = tf.layers.conv2d({
            filters: 1,
            kernelSize: 1,
            //activation: "relu",
            padding: "same",
            strides: 1,
            useBias: false,
            kernelInitializer: 'VarianceScaling',
        }).apply(sum_layer3)

        var changed_coords = (new GetChangedCoords()).apply(input)
        var muled_out = tf.layers.multiply().apply([changed_coords,final_layer])

        var pooled_data = tf.layers.globalAveragePooling2d({
            //poolSize: [game_size.ysize,game_size.xsize],
        //    strides: null
        }).apply(muled_out)
        //var flatten_layer = tf.layers.flatten().apply(pooled_data)
        //var sum_layer_sum = new ai_utils.ArraySum().apply(flatten_layer)
        //var sum_layer_sum = tf.sum(sum_layer2)
        //var scaled_sum = (new ai_utils.ScalarMult(0.1)).apply(pooled_data)
        //model.add(new ScalarAdd(-5))
        //model.add(tf.layers.activation({activation: 'sigmoid'}))
        //model.add(tf.layers.flatten())
        var model = tf.model({
            inputs: input,
            outputs: pooled_data,
        });
        const optimizer = tf.train.adam();
        model.compile({
          optimizer: optimizer,
          loss: state_loss,
          metrics: ['accuracy'],
        });
        this.model = model
    }
    get_better_prob_batched(paired_bin_maps,callback){
        var input = tf.tensor4d(ai_utils.flatten(paired_bin_maps),[paired_bin_maps.length,paired_bin_maps[0].length,paired_bin_maps[0][0].length,paired_bin_maps[0][0][0].length])
        var outarrray = tf.sigmoid(this.model.predict(input,{batch_size:16}))

        outarrray.data().then(function(result) {
          callback(result);
      })
    }
    /*get_better_prob(game_state1,game_state2,myplayer,callback) {
        var bin_map1 = binary.map_to_vec(game_state1,myplayer)
        var bin_map2 = binary.map_to_vec(game_state2,myplayer)
        var tensor_shape = [1,bin_map1.length,bin_map1[0].length,bin_map1[0][0].length]
        var i1 = tf.tensor4d(ai_utils.flatten(bin_map1),tensor_shape)
        var i2 = tf.tensor4d(ai_utils.flatten(bin_map2),tensor_shape)
        var input = tf.concat([i1,i2],3)
        var outarrray = tf.sigmoid(this.model.predict(input))
        outarrray.data().then(function(result) {
          console.log("model infered!"); // "Stuff worked!"
          console.log(result)
          callback(result);
        }, function(err) {
          console.log("model failed!"); // Error: "It broke"
          console.log(err);
        });
    }*/
    train_on(records,myplayer_name,finished_callback){
        var ins_outs = extract_train_vectors(records,myplayer_name)
        this.train_assuming_best(ins_outs.inputs,ins_outs.outputs,finished_callback)
    }
    train_assuming_best(inputs,outputs,finished_callback) {
        var num_batches = 100;
        var batch_size = 8;
        var input_tensor = tf.tensor4d(ai_utils.flatten(inputs),[inputs.length,inputs[0].length,inputs[0][0].length,inputs[0][0][0].length])
        console.log("outputs.length")
        console.log(outputs.length)
        var outputs_tensor = tf.tensor2d(outputs,[outputs.length,1])
        var model_result = this.model.fit(
            input_tensor,
            outputs_tensor,
            {
                batchSize: batch_size,
                epochs: 10,
                shuffle: true,
                //validationSplit: 0.3,
                //verbose: true,
                //validationSplit: 0.2,
            }
        )
        model_result.then((result)=> {
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
    tournament_eval: tournament_eval,
}
