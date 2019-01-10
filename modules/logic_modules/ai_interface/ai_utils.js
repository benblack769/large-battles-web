
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
function find_idx(arr,val,low,high){
    let mid = (low + high) / 2;
    if(prob_cumsum[mid+1] <= val){
        return find_idx(arr,val,mid+1,high);
    }
    else if(prob_cumsum[mid] > val){
        return find_idx(arr,val,low,mid);
    }
    else{
        return mid;
    }
}
class DiscreteDistribution {
    constructor(val_array){
        var length = val_array.length+1;
        var prob_cumsum = new Array(length);
        var sum = 0;
        for(var i = 0; i < length; i++){
            prob_cumsum[i] = sum;
            sum += val_array[i];
        }
        prob_cumsum[length] = sum;
        this.prob_cumsum = prob_cumsum
    }
    sample(){
        var search_val = Math.random()*this.prob_cumsum[this.prob_cumsum.length-1]
        var idx = find_idx(this.prob_cumsum,0,this.prob_cumsum.length)
        return idx
    }
}
function idx_to_coord(idx,game_size){
    return {x:idx/game_size.xsize,y:idx%game_size.xsize}
}
function sample_prob_map(prob_map){
    var dist = new DiscreteDistribution()
}
function make_map_with_single_set(game_size,coord){
    var res = new Array(game_size.ysize)
    for(var y = 0; y < game_size.ysize; y++){
        res[y] = (new Array(game_size.xsize)).fill(0)
    }
    res[coord.y][coord.x] = 1.0
    return res
}
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
module.exports = {
    make_map_with_single_set:make_map_with_single_set,
    flatten: flatten,
    ScalarMult: ScalarMult,
}
