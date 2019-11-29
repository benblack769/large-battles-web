var pathing = require("./pathing.js")
var calc_stat = require("./types.js").calc_stat
var validate_instruction = require("./validate_instruction.js").validate_instruction
var decompose_instructions = require("./decompose_instructions.js").decompose_instructions
var consume_instructions = require("./consume_instructions.js").consume_change
var base_ops = require("./base_ops.js")

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
function process_instruction(game_state,instr){
    var active_player = (game_state.players && game_state.players.active_player)
            ? game_state.players.active_player
            : "__server";
    var error = validate_instruction(game_state,instr,active_player)
    if(error){
        var alert_str = "Game record has an error. Possibly from an incompatable version of the game. Error message: "+error.message
        console.assert(alert_str)
    }
    var instr_parts = decompose_instructions(game_state,instr,active_player)
    instr_parts.forEach(function(part){
        //change local game state
        consume_instructions(game_state,part)
    })
}
function process_record_til_end(record){
    var game_state = {}
    record.forEach(function(instruction){
        process_instruction(game_state,instruction)
    })
    return game_state
}

module.exports = {
    process_instruction: process_instruction,
    process_record_til_end: process_record_til_end,
    is_valid_instr: is_valid_instr,
    get_instr_err: validate_instruction,
    simulate_instruction: simulate_instruction,

    map_to_state_changes: base_ops.map_to_state_changes,
    make_init_instr: base_ops.make_init_instr,
    get_possible_moves: base_ops.get_possible_moves,
    is_possible_move: base_ops.is_possible_move,
    is_possible_attack: base_ops.is_possible_attack,
    get_shortest_path: base_ops.get_shortest_path,
    distance: base_ops.distance,
    get_move_range: base_ops.get_move_range,
    get_attack_range: base_ops.get_attack_range,
    get_build_radius: base_ops.get_build_radius,
    get_make_equip: base_ops.get_make_equip,
    get_make_unit: base_ops.get_make_unit,
    is_empty: base_ops.is_empty,
    at: base_ops.at,
    all_coords: base_ops.all_coords,
    coords_around: base_ops.coords_around,
    is_valid: base_ops.is_valid,
    is_unit: base_ops.is_unit,
    is_moveable_unit: base_ops.is_moveable_unit,
    is_build_radius_unit: base_ops.is_build_radius_unit,
    find_tc: base_ops.find_tc,
    is_mine: base_ops.is_mine,
    deep_copy: base_ops.deep_copy,
    deep_equals: base_ops.deep_equals,
}
