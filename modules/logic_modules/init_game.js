var CMath = require('./coord_engine.js').CMath
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
function get_player_start_coords(gamesize){
    var cmath = new CMath(gamesize.xsize, gamesize.ysize)
    var min_dist_from_borders = 3
    var min_dist_from_players = 5
    var player_centers = [];
    for(var i = 0; i < num_players; i++){
        var center;
        do {
            center = cmath.random_coord()
        } while (cmath.min_distance(center,player_centers) < min_dist_from_players ||
                cmath.dist_border(center) < min_dist_from_borders);
        player_centers.push(center)
    }
    return player_centers
}
function place_initial_units(gamesize,player_ids){
    var centers = get_player_start_coords(gamesize)
    var all_messages = []
    for(var i = 0; i < num_players; i++){
        var cen = centers[i]
        var barracks = create_utils.create_unit("barracks",player_ids[i])
        all_messages.push({
            type: "CREATE",
            data: barracks,
            coord: cen,
        })
        var farm_coord = {
            x: cen.x+1,
            y: cen.y
        }
        var farm = create_utils.create_unit("farm",player_ids[i])
        all_messages.push({
            type: "CREATE",
            data: farm,
            coord: farm_coord,
        })
        var soldier_coord = {
            x: cen.x,
            y: cen.y+1
        }
        var soldier = create_utils.create_unit("soldier",player_ids[i])
        all_messages.push({
            type: "CREATE",
            data: soldier,
            coord: soldier_coord,
        })
    }
    return all_messages
}
module.exports = {
    init_map: init_map,
    init_oppupied: init_oppupied,
    place_initial_units: place_initial_units,
}
