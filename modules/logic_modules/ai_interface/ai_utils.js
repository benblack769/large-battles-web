
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
module.exports = {
    make_map_with_single_set:make_map_with_single_set,
    flatten: flatten,
    expand_last_dim: expand_last_dim,
    spread_to_dim: spread_to_dim,
    center_map_at_with_filled_zeros: center_map_at_with_filled_zeros,
}
