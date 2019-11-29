var clib = require("../coord_lib.js")
var binary = require("./to_binary.js")
var array_nd = require("../array_nd.js")
var type_utils = require("./type_utils.js")
var default_stats =  require("../types.js").default_stats
var learn_utils = require("./learn_utils.js")


class MajorCoordLearnStreamer extends learn_utils.LearnStreamer{
    constructor(records,myplayer){
        super(records,myplayer)
        this.game_size = records[0][0].game_size
    }
    get_data_batch(result_batch_size){
        console.assert(result_batch_size%4 === 0)
        var get_batch_size = result_batch_size/4
        var small_batch_indicies = this.get_batch_idxs(get_batch_size,this.major_condition.bind(this))
        var small_batch_inputs = small_batch_indicies
            .map((idxs)=>this.getBinState(this.idxBefore(idxs)))
        var small_batch_inputs_bef = small_batch_indicies
            .map((idxs)=>this.getBinState(this.idxBefore(this.idxBefore(idxs))))
        var concatted = array_nd.concat_dim(small_batch_inputs,small_batch_inputs_bef,3)
        var small_batch_outputs = small_batch_indicies
            .map((idxs)=>array_nd.make_map_with_single_set(this.game_size,type_utils.major_coord(this.getInstr(idxs))))
        return {
            inputs: this.rotate_batch(concatted),
            outputs: this.rotate_batch(small_batch_outputs),
        }
    }
    major_condition(idxs){
        var game_state = this.getState(idxs)
        return idxs[1] > 2
            && game_state.players
            && game_state.players.active_player === this.myplayer
            && type_utils.major_coord(this.getInstr(idxs))
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
      this.model = null
      this.is_loaded = false
       tf.loadFrozenModel("web_model/tensorflowjs_model.pb","web_model/weights_manifest.json")
            .then((model)=>{
                this.model = model
                this.is_loaded = true
                console.log("model loaded")
                console.log(model)
            },(err)=>{
                console.log("load model failed")
                console.log(err)
            })
    }
    get_all_prob_maps(bin_maps,callback){
        var input = tf.tensor4d(array_nd.flatten(bin_maps),[bin_maps.length,bin_maps[0].length,bin_maps[0][0].length,bin_maps[0][0][0].length])
        var outs = this.model.execute({
            //batchSize: 32,
            input: input,
        })
        var prob_outs = tf.sigmoid(outs)
        prob_outs.data().then(function(result){
            console.log("dim_spreads")
            console.log(result.length)
            console.log([bin_maps.length,bin_maps[0].length,bin_maps[0][0].length])
            var dim_spread = array_nd.spread_to_dim(result,[bin_maps.length,bin_maps[0].length,bin_maps[0][0].length])
            callback(dim_spread)
        })
    }
    get_prob_map(game_state,old_game_state,myplayer,callback) {
        var bin_map = binary.map_to_vec(game_state,myplayer)
        var bin_map2 = binary.map_to_vec(old_game_state,myplayer)
        var concatted = array_nd.concat_dim(bin_map,bin_map2,2)
        var input = tf.tensor4d([concatted])
        var outarrray = (this.model.execute({
            //batchSize: 32,
            input: input,
        }))
        outarrray.data().then(function(result) {
          console.log("model infered!"); // "Stuff worked!"
          //console.log(result)
          var spread_res = array_nd.spread_to_dim(result,[game_state.game_size.ysize,game_state.game_size.xsize])
          //console.log(spread_res)
          console.log(Math.max.apply(null,result))
          callback(spread_res);
        }, function(err) {
          console.log("model failed!"); // Error: "It broke"
          console.log(err);
        });
    }
    train_on(records,myplayer_name,finished_callback){
        return
    }
}
module.exports = {
    MainCoordLearner: MainCoordLearner,
    MajorCoordLearnStreamer: MajorCoordLearnStreamer,
}
