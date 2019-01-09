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
function make_train_comparitors(num_samples){
    var res = new Float32Array(num_samples*2)
    for(var i = 0; i < num_samples; i++){
        res[i] = 0.0;
    }
    for(var i = num_samples; i < num_samples*2; i++){
        res[i] = 1.0;
    }
    return res;
}
function to_farray(offset,size){
    return Module.HEAPF32.subarray(offset/4,offset/4+size)
}
function prod(arr){
    var res = 1;
    for(var i = 0; i < arr.length; i++){
        res *= arr[i]
    }
    return res;
}
function wrap_arr_input(arr){
    return new Uint8Array(arr.buffer)
}
function get_sample_data(bin_map,prob_map,act_coord,game_size,num_samples,radius){
    var flat_bin_map = flatten(bin_map)
    var flat_prob_map = flatten(prob_map)
    Module.fns.setGameSize(game_size.xsize,game_size.ysize)
    var num_bin_dims = bin_map[0][0].length
    Module.fns.setNumConvertDims(num_bin_dims)
    var train_size = radius * 2 + 1
    var train_shape = [num_samples*2,train_size,train_size,num_bin_dims]
    var train_len = prod(train_shape)
    var c_train_inputs = Module.fns.make_train_examples(wrap_arr_input(flat_prob_map),wrap_arr_input(flat_bin_map),num_samples,radius,act_coord.x,act_coord.y)
    var train_input_arr = to_farray(c_train_inputs,train_len).slice()
    var train_comparitors = make_train_comparitors(num_samples)
    console.log("train data")
    console.log(c_train_inputs)
    console.log(train_input_arr)
    console.log(train_shape)
    return {
        inputs: tf.tensor4d(train_input_arr,train_shape),
        outputs: tf.tensor1d(train_comparitors),
    }
}
function wrap_fns(){
    var fns = {
        add: Module.cwrap("add",'number',['number','number']),
        setGameSize: Module.cwrap("setGameSize",null,['number','number']),
        setNumConvertDims: Module.cwrap("setNumConvertDims",null,['number']),
        make_train_examples: Module.cwrap("make_train_examples",'number',['array','array','number','number','number','number']),
    }
    Module.fns = fns
}
module.exports = {
    flatten:flatten,
    wrap_fns:wrap_fns,
    get_sample_data: get_sample_data,
}
