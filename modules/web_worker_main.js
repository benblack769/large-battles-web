var pathing = require("./logic_modules/pathing.js")
var calc_stat = require("./logic_modules/types.js").calc_stat
var validate_instruction = require("./logic_modules/validate_instruction.js").validate_instruction
var decompose_instructions = require("./logic_modules/decompose_instructions.js").decompose_instructions
var consume_instructions = require("./logic_modules/consume_instructions.js").consume_change

function get_stat_fn(stat_name){
    return function(game_state,coord){
        return calc_stat(game_state.stats,at(game_state.map,coord),stat_name)
    }
}
function is_valid_instr(game_state,instr,player){
    return ! validate_instruction(game_state,instr,player)
}
function simulate_instruction(game_state,instr,player){
    if(is_valid_instr(game_state,instr,player)){
        var decomps = decompose_instructions(game_state,instr,player)
        decomps.forEach(function(sinstr){
            consume_instructions(game_state,sinstr)
        })
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
    if(!game_state){
        return true
    }
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
function is_unit(map,coord){
    return at(map,coord).category === "unit"
}
function is_mine(game_state,coord){
    if(!is_unit(game_state.map,coord)){
        return false
    }
    if(at(game_state.map,coord).player !== game_state.my_player){
        return false
    }
    return true
}
function is_moveable_unit(game_state,coord){
    if(!is_unit(game_state.map,coord)){
        return false
    }
    if(!is_mine(game_state,coord)){
        return false
    }
    if(!self.lib.get_move_range(game_state,coord)){
        return false
    }
    return true
}


self.lib = {
    get_possible_moves: pathing.get_possible_moves,
    is_possible_move: pathing.is_possible_move,
    get_shortest_path: pathing.get_shortest_path,
    distance: pathing.distance,
    get_move_range: get_stat_fn("move_range"),
    get_attack_range: get_stat_fn("attack_range"),
    is_empty: is_empty,
    at: at,
    all_coords: all_coords,
    coords_around: coords_around,
    is_valid_instr: is_valid_instr,
    simulate_instruction: simulate_instruction,
    is_valid: is_valid,
    is_unit: is_unit,
    is_moveable_unit: is_moveable_unit,
    is_mine: is_mine,
}


function default_set_data(function_id,game_state){
    self.set_id = function_id
    if(self.on_set_fn){
        //if set_fn is defined in library, call it too.
        self.on_set_fn(function_id,game_state)
    }
}
function selector_clicked(selector_name,game_state){
    if(self.on_selector_click){
        self.on_selector_click(selector_name,game_state)
    }
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
self.changeData = function(id,key,value){
    current_data[id][key] = value
    postMessage({
        type: "CHANGE_DATA",
        id: id,
        key: key,
        value: value,
    })
}
self.get_data_by_key = function(id,key){
    return deep_copy(current_data[id][key])
}
self.click_handler = function(click){
    console.log("default click activated. You need to set 'self.click_handler' in your library code")
}
self.set_id = ""
var current_data = {}
self.globals = {}
function replace_lib(js_code){
    //console.log("replaced library with: "+js_code)
    self.globals = {};
    (new Function(js_code))()
    self.on_set_fn(self.set_id)
}
onmessage = function(message){
    var message = message.data
    switch(message.type){
        case "REPLACE_FUNCTION": message.game_state.my_player = message.my_player;
                                 default_set_data(message.function_id,message.game_state); break;
        case "REPLACE_LIBRARY": replace_lib(message.js_str); break;
        case "CLICK_OCCURED": message.game_state.my_player = message.my_player;
                              click_handler(message.coord, message.game_state); break;
        case "SELECTOR_CLICKED": message.game_state.my_player = message.my_player;
                                 selector_clicked(message.selector_name,message.game_state); break;
        case "DATA_CHANGED": current_data = message.data;
    }
}
