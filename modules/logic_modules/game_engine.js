var x_size = 60;
var y_size = 40;
var num_players = 2;

function init_game(){
    var game = new Array(y_size)
    for(var i = 0; i < y_size; i++){
        game[i] = new Array(x_size)
        for(var j = 0; j < x_size; j++){
            game[i][j] = create_empty()
        }
    }
    return game
}
function create_empty(){
    return {
        "category": "empty"
    }
}
function get_player_start_coords(){
    var min_dist_from_borders = 0.1
    var min_dist_from_players = 0.2
    var player_centers = new Array(num_players);
    for(var i = 0; i < num_players; i++){
        var center;
        do{
            center = random_coord()
        }while(min_distance(center,player_centers) > min_dist_from_players &&
                dist_border(center) > min_dist_from_borders)
    }
}
function place_initial_units(game_data){
}
function create_unit(unit_type,unit_info){
    return {
        "category": "unit",
        "type": unit_type,
        "stats": unit_info['stats'],
        "icon": unit_info['icon'],
    }
}
module.exports = {
    init_game: init_game,
}
