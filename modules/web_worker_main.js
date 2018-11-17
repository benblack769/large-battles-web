var pathing = require("./logic_modules/pathing.js")
var calc_stat = require("./logic_modules/types.js").calc_stat
var validate_instruction = require("./logic_modules/validate_instruction.js").validate_instruction

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
function all_coords(game_state){
    var res = []
    for(var y = 0; y < game_state.map.length; y++){
        for(var x = 0; x < game_state.map[y].length; x++){
            res.push({x:x,y:y})
        }
    }
    return res;
}
function is_valid(game_state,coord){
    var map = game_state.map
    return map[coord.y] && map[coord.y][coord.x];
}
function coords_around(game_state,center,range){
    var res = []
    for(var y = center.y-range; y <= center.y+range; y++){
        for(var x = center.x-range; x <= center.x+range; x++){
            var c = {x:x,y:y}
            if(is_valid(game_state,c)){
                res.push(c)
            }
        }
    }
    return res;
}


self.lib = {
    get_possible_moves: pathing.get_possible_moves,
    get_move_range: get_stat_fn("move_range"),
    is_empty: is_empty,
    at: at,
    all_coords: all_coords,
    coords_around: coords_around,
    validate_instruction: validate_instruction,
    is_valid: is_valid,
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
        case "CLICK_OCCURED": message.game_state.my_player = message.my_player;
                              click_handler(message.coord, message.game_state); break;
    }
}
