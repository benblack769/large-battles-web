var clib = require("../coord_lib.js")
var binary = require("./to_binary.js")
var ai_utils = require("./ai_utils.js")
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
        var small_batch_outputs = small_batch_indicies
            .map((idxs)=>ai_utils.make_map_with_single_set(this.game_size,type_utils.major_coord(this.getInstr(idxs))))
        return {
            inputs: this.rotate_batch(small_batch_inputs),
            outputs: this.rotate_batch(small_batch_outputs),
        }
    }
    major_condition(idxs){
        var game_state = this.getState(idxs)
        return idxs[1] > 1
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
    get_all_prob_maps(bin_maps,callback){
        var input = tf.tensor4d(ai_utils.flatten(bin_maps),[bin_maps.length,bin_maps[0].length,bin_maps[0][0].length,bin_maps[0][0][0].length])
        var outs = this.model.predict({
            batchSize: 32,
        })
        var prob_outs = tf.sigmoid(outs)
        prob_outs.data().then(function(result){
            console.log("dim_spreads")
            console.log(result.length)
            console.log([bin_maps.length,bin_maps[0].length,bin_maps[0][0].length])
            var dim_spread = ai_utils.spread_to_dim(result,[bin_maps.length,bin_maps[0].length,bin_maps[0][0].length])
            callback(dim_spread)
        })
    }
    get_prob_map(game_state,myplayer,callback) {
        var bin_map = binary.map_to_vec(game_state,myplayer)
        var input = tf.tensor4d([bin_map])
        var outarrray = tf.sigmoid(this.model.predict(input))
        outarrray.data().then(function(result) {
          console.log("model infered!"); // "Stuff worked!"
          //console.log("dim_spreads")
          var spread_res = ai_utils.spread_to_dim(result,[game_state.game_size.ysize,game_state.game_size.xsize])
          //console.log(spread_res)
          console.log(Math.max.apply(null,result))
          callback(spread_res);
        }, function(err) {
          console.log("model failed!"); // Error: "It broke"
          console.log(err);
        });
    }
    train_on(records,myplayer_name,finished_callback){
        var learn_streamer = new MajorCoordLearnStreamer(records,myplayer_name)
        const data_batch_size = 1024;
        const train_batch_size = 16;
        var learn_step = 0
        var recursive_train_callback = ()=>{
            if(learn_step > 3){
                finished_callback()
                return
            }
            learn_step++
            var batch_data = learn_streamer.get_data_batch(data_batch_size)
            this.train_assuming_best(batch_data.inputs,batch_data.outputs,train_batch_size,recursive_train_callback)
        }
        recursive_train_callback()
    }
    train_assuming_best(inputs,outputs,batch_size,finished_callback) {
        var input_tensor = tf.tensor4d(ai_utils.flatten(inputs),[inputs.length,inputs[0].length,inputs[0][0].length,inputs[0][0][0].length])
        var outputs_tensor = tf.tensor4d(ai_utils.flatten(outputs),[outputs.length,outputs[0].length,outputs[0][0].length,1])
        var model_result = this.model.fit(
            input_tensor,
            outputs_tensor,
            {
                batchSize: batch_size,
                epochs: 2,
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
