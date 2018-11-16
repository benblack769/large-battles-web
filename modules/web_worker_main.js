var pathing = require("./logic_modules/pathing.js")
var calc_stat = require("./logic_modules/types.js").calc_stat

function get_stat_fn(stat_name){
    return function(game_state,coord){
        return calc_stat(game_state.stats,at(game_state.map,coord),stat_name)
    }
}
function at(map,coord){
    return map[coord.y][coord.x]
}
function is_empty(map,coord){
    return at(map,coord).category === "empty"
}

self.lib = {
    get_possible_moves: pathing.get_possible_moves,
    get_move_range: get_stat_fn("move_range"),
    is_empty: is_empty,
    at: at,
}


function default_set_data(json_data){
    self.set_data = json_data
    if(self.on_set_fn){
        //if set_fn is defined in library, call it too.
        self.on_set_fn(json_data)
    }
}
self.click_handler = function(click){
    console.log("default click activated. You need to set 'self.click_handler' in your library code")
}
self.set_data = {}
self.globals = {}
function replace_lib(js_code){
    //console.log("replaced library with: "+js_code)
    self.globals = {};
    (new Function(js_code))()
}
onmessage = function(message){
    var message = message.data
    switch(message.type){
        case "REPLACE_FUNCTION": default_set_data(JSON.parse(message.json_data)); break;
        case "REPLACE_LIBRARY": replace_lib(message.js_str); break;
        case "CLICK_OCCURED": message.game_state.active_player = message.active_player;
                              click_handler(message.coord, message.game_state); break;
    }
}
