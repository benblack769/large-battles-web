var pathing = require("./pathing.js")
var calc_stat = require("./types.js").calc_stat
var validate_instruction = require("./validate_instruction.js").validate_instruction
var decompose_instructions = require("./decompose_instructions.js").decompose_instructions
var consume_instructions = require("./consume_instructions.js").consume_change

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
function first_if_there(arr){
    return arr ? arr[0] : null
}
function get_make_equip(gs,c){
    return first_if_there(get_stat_fn("can_make_equip")(gs,c))
}
function get_make_unit(gs,c){
    return first_if_there(get_stat_fn("can_make")(gs,c))
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}

module.exports = {
    get_possible_moves: pathing.get_possible_moves,
    is_possible_move: pathing.is_possible_move,
    get_shortest_path: pathing.get_shortest_path,
    distance: pathing.distance,
    get_move_range: get_stat_fn("move_range"),
    get_attack_range: get_stat_fn("attack_range"),
    get_make_equip: get_make_equip,
    get_make_unit: get_make_unit,
    is_empty: is_empty,
    at: at,
    all_coords: all_coords,
    coords_around: coords_around,
    is_valid_instr: is_valid_instr,
    get_instr_err: validate_instruction,
    simulate_instruction: simulate_instruction,
    is_valid: is_valid,
    is_unit: is_unit,
    is_moveable_unit: is_moveable_unit,
    is_mine: is_mine,
    deep_copy: deep_copy,
}
