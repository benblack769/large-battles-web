
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
    flatten: flatten,
    ScalarMult: ScalarMult,
}
