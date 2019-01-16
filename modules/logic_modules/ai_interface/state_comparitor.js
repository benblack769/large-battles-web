var clib = require("../coord_lib.js")
var binary = require("./to_binary.js")
var ai_utils = require("./ai_utils.js")
var type_utils = require("./type_utils.js")
var default_stats =  require("../types.js").default_stats
var sample_move = require("./sample_move.js")
var learn_utils = require("./learn_utils.js")
var random = require("../random_helpers.js")


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
class StateCompareLearnStreamer extends learn_utils.LearnStreamer{
    constructor(records,myplayer){
        super(records,myplayer)
        this.game_size = records[0][0].game_size
    }
    get_data_batch(result_batch_size){
        var rotation_size = 4
        console.assert(result_batch_size%4 === 0)
        var get_batch_size = result_batch_size/4
        var small_batch_indicies = this.get_batch_idxs(get_batch_size,this.major_condition.bind(this))
        var small_batch_outputs = []
        var small_batch_inputs = []
        small_batch_indicies.forEach((idxs)=>{
            var instr = this.getInstr(idxs)
            var major_coord = type_utils.major_coord(instr)
            var orig_state = this.getState(this.idxBefore(idxs))
            var all_false_moves = sample_move.all_moves_given_major(orig_state,major_coord,this.myplayer)
                        .filter(false_instr=>!clib.deep_equals(instr,false_instr))
            var false_instr_sample = random.sample_array(all_false_moves)
            var compare_data = make_comparison_data(orig_state,instr,false_instr_sample,this.getCmapper(idxs))
            small_batch_inputs.push(compare_data.inputs)
            small_batch_outputs.push(compare_data.outputs)
        })
        return {
            inputs: this.rotate_batch(small_batch_inputs),
            outputs: [].concat(small_batch_outputs,small_batch_outputs,
                               small_batch_outputs,small_batch_outputs),
        }
    }
    major_condition(idxs){
        if(idxs[1] < 2){
            return false
        }
        var game_state = this.getState(idxs)
        var before_state = this.getState(this.idxBefore(idxs))
        var instr = this.getInstr(idxs)
        var major_coord = type_utils.major_coord(instr)
        return game_state.players
            && game_state.players.active_player === this.myplayer
            && major_coord
            && sample_move.all_moves_given_major(before_state,major_coord,this.myplayer)
                .filter((false_instr)=>!clib.deep_equals(instr,false_instr))
                .length > 0 //can't compare with 0 options!
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
class StateComparitor {
    constructor(game_size) {
      this.model = null
      this.is_loaded = false
       tf.loadFrozenModel("state_web_model/tensorflowjs_model.pb","state_web_model/weights_manifest.json")
            .then((model)=>{
                this.model = model
                this.is_loaded = true
                console.log("state model loaded")
                console.log(model)
            },(err)=>{
                console.log("load model failed")
                console.log(err)
            })
    }
    get_better_prob_batched(paired_bin_maps,callback){
        var input = tf.tensor4d(ai_utils.flatten(paired_bin_maps),[paired_bin_maps.length,paired_bin_maps[0].length,paired_bin_maps[0][0].length,paired_bin_maps[0][0][0].length])
        var outarrray = tf.sigmoid(this.model.execute({input:input}))

        outarrray.data().then(function(result) {
          callback(result);
      })
    }
}
module.exports = {
    StateComparitor: StateComparitor,
    StateCompareLearnStreamer: StateCompareLearnStreamer,
    tournament_eval: tournament_eval,
}
