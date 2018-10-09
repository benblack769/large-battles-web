var x_size = 60;
var y_size = 40;

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
function create_unit(unit_type,unit_info){
    return {
        "category": "unit",
        "type": unit_type,
        "stats": unit_info['stats'],
        "icon": unit_info['icon'],
    }
}
