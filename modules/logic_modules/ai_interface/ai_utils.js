
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
function spread_to_dim(arraynd,dims){
    var dim_num = dims[0]
    if(arraynd.length % dim_num !== 0){
        console.assert(false,"spread dim not good");
    }
    if(dims.length === 1){
        return arraynd
    }
    var offset_num = arraynd.length / dim_num
    var res = new Array(dim_num)
    var lower_dims = dims.slice(1)
    for(var i = 0; i < dim_num; i++){
        res[i] = spread_to_dim(arraynd.subarray(i*offset_num,(i+1)*offset_num),lower_dims)
    }
    return res
}
function make_map_with_single_set(game_size,coord){
    var res = new Array(game_size.ysize)
    for(var y = 0; y < game_size.ysize; y++){
        res[y] = (new Array(game_size.xsize)).fill(0)
    }
    res[coord.y][coord.x] = 1.0
    return res
}
/*function make_scalar_mult(){
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
    return ScalarMult
}*/
module.exports = {
    make_map_with_single_set:make_map_with_single_set,
    flatten: flatten,
    spread_to_dim: spread_to_dim,
}
