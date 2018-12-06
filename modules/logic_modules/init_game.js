var create_utils = require("./create_utils.js")

var num_players = 2;

function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function init2d(gamesize,value){
    var map = new Array(gamesize.ysize)
    for(var i = 0; i < gamesize.ysize; i++){
        map[i] = new Array(gamesize.xsize)
        for(var j = 0; j < gamesize.xsize; j++){
            map[i][j] = deep_copy(value)
        }
    }
    return map
}
function init_map(gamesize){
    return init2d(gamesize,create_utils.create_empty())
}
function init_oppupied(gamesize,player_order){
    var init_occ = {}
    player_order.forEach(function(player){
        init_occ[player] = 0
    })
    return init2d(gamesize,init_occ)
}
function rand_int(max_val){
    return Math.floor(Math.random()*max_val)
}
function get_coord(dim_size){
    var border_avoid = 6
    return rand_int(dim_size-border_avoid*2)+border_avoid
}
function distance(c1,c2){
    return Math.max(Math.abs(c1.x-c2.x),Math.abs(c1.y-c2.y))
}
function get_init_coord(gamesize){
    var min_player_distance = 16
    do{
        var coord = {
            x: get_coord(gamesize.xsize),
            y: get_coord(gamesize.ysize),
        }
    }
    while(distance(coord,reflect_over_axes(gamesize,coord)) < min_player_distance);
    return coord
}
function reflect_dim(size,val){
    return size - val - 1
}
function reflect_over_axes(gamesize,coord){
    return {
        x: reflect_dim(gamesize.xsize,coord.x),
        y: reflect_dim(gamesize.ysize,coord.y),
    }
}
function farm_coords(cen_coord){
    var res = []
    for(var x = 0; x < 2; x++){
        for(var y = 0; y < 3; y++){
            res.push({
                x:cen_coord.x+x,
                y:cen_coord.y+y,
            })
        }
    }
    return res
}
function place_initial_units(gamesize,player_ids){
    var init_coord = get_init_coord(gamesize)
    var refl_coord = reflect_over_axes(gamesize,init_coord)
    console.log("init_coord")
    console.log(init_coord)
    console.log(refl_coord)
    var centers = [init_coord,init_coord]
    var transform = [function(v){return v}, function(v){return reflect_over_axes(gamesize,v)}]
    var all_messages = []
    for(var i = 0; i < num_players; i++){
        var cen = centers[i]
        var trans = transform[i]
        var barracks = create_utils.create_unit("barracks",player_ids[i])
        var barracks_coord = {
            x: cen.x-1,
            y: cen.y,
        }
        all_messages.push({
            type: "CREATE",
            data: barracks,
            coord: trans(barracks_coord),
        })
        farm_coords(cen).forEach(function(farm_coord){
            var farm = create_utils.create_unit("farm",player_ids[i])
            all_messages.push({
                type: "CREATE",
                data: farm,
                coord: trans(farm_coord),
            })
        })
        var soldier_coord = {
            x: cen.x,
            y: cen.y-1
        }
        var soldier = create_utils.create_unit("soldier",player_ids[i])
        all_messages.push({
            type: "CREATE",
            data: soldier,
            coord: trans(soldier_coord),
        })
    }
    return all_messages
}
module.exports = {
    init_map: init_map,
    init_oppupied: init_oppupied,
    place_initial_units: place_initial_units,
}
