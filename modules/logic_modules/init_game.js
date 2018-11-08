var CMath = require('./coord_engine.js').CMath
var game_config = require("./types.js")
var create_utils = require("./create_utils.js")

var num_players = 2;

function init_map(gamesize){
    var map = new Array(gamesize.ysize)
    for(var i = 0; i < gamesize.ysize; i++){
        map[i] = new Array(gamesize.xsize)
        for(var j = 0; j < gamesize.xsize; j++){
            map[i][j] = create_utils.create_empty()
        }
    }
    return map
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
        var data = create_utils.create_unit("soldier",game_config.unit_types['soldier'],player_ids[i])
        all_messages.push({
            type: "CREATE",
            data: data,
            coord: cen,
        })
    }
    return all_messages
}
module.exports = {
    init_map: init_map,
    place_initial_units: place_initial_units,
}
