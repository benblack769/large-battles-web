
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
function center_map_at_with_filled_zeros(map,c){
    var zeros = map[0][0].map(a=>0)
    var r = 15;
    var size = r*2+1;
    var res_map = new Array(size)
    for(var y = c.y-r; y <= c.y+r; y++){
        var res_row = new Array(size)
        for(var x = c.x-r; x <= c.x+r; x++){
            if(map[y] && map[y][x]){
                res_row[x-(c.x-r)] = map[y][x]
            }
            else{
                res_row[x-(c.x-r)] = zeros
            }
        }
        res_map[y-(c.y-r)] = res_row
    }
    return res_map
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
function expand_last_dim(map){
    var res = new Array(map.length)
    for(var y = 0; y < map.length; y++){
        res[y] = map[y].map((val)=>[val])
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
function get_dims(arrnd){
    var shape = []
    var firstarr = arrnd;
    while(firstarr.length){
        shape.push(firstarr.length)
        firstarr = firstarr[0];
    }
    return shape
}

function float32concat(first, second){
    var firstLength = first.length;
    var result = new Float32Array(firstLength + second.length);

    result.set(first);
    result.set(second, firstLength);

    return result;
}
function variable_concat(arr1,arr2){
    if(arr1.concat){
        return arr1.concat(arr2)
    }
    else{
        return float32concat(arr1,arr2)
    }
}

function concat_dim(arrnd1,arrnd2,dim){
    if(!dim){
        return variable_concat(arrnd1,arrnd2)
    }
    else{
        if(arrnd1.length !== arrnd2.length){
            //console.log(arrnd1.length)
            //console.log(arrnd2.length)
            console.assert(false,"bad concat dims")
        }
        var res = new Array(arrnd1.length)
        for(var i = 0; i < arrnd1.length; i++){
            res[i] = concat_dim(arrnd1[i],arrnd2[i],dim-1)
        }
        return res
    }
}
function deep_equals_arrnd(o1,o2){
    if(o1.length){
        if(o1.length != o2.length){
            return false;
        }
        for(var i = 0; i < o1.length; i++){
            if(!deep_equals_arrnd(o1[i], o2[i])){
                return false
            }
        }
        return true
    }
    else{
        return o1 == o2
    }
}
function arraynd_to_str(arr){
    return JSON.stringify({
        shape: get_dims(arr),
        data: Buffer.from(flatten(arr)).toString('base64'),
    })
}

function from_arraynd_str(data){
    var d = JSON.parse(data)
    var arr = new Float32Array(Buffer.from(d.data, 'base64'))
    var spread_arr = spread_to_dim(arr,d.shape)
    return spread_arr
}


module.exports = {
    make_map_with_single_set: make_map_with_single_set,
    flatten: flatten,
    expand_last_dim: expand_last_dim,
    spread_to_dim: spread_to_dim,
    get_dims: get_dims,
    center_map_at_with_filled_zeros: center_map_at_with_filled_zeros,
    concat_dim: concat_dim,
    deep_equals_arrnd: deep_equals_arrnd,
    arraynd_to_str: arraynd_to_str,
    from_arraynd_str: from_arraynd_str,
}
