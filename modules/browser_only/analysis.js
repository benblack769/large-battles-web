var types = require("../logic_modules/types.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")
var interaction_comps = require("./game_display/interaction_components.js")
var base_inter = require("./game_display/base_component.js")
var signals = require("./game_display/global_signals.js")
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var clib = require("../logic_modules/coord_lib.js")
var init_game = require("../logic_modules/init_game.js")
var nav_signal = require("./nav_signal.js")

function process_instruction_record(record){
    var cur_game_state = {}
    var state_list = []
    var state_instr_list = []
    var active_player = "__server"
    record.forEach(function(instruction){
        var error = validate.validate_instruction(cur_game_state,instruction,active_player)
        if(error){
            alert("Game record has an error. Possibly from an incompatable version of the game. Error message: "+error.message)
        }
        var instr_parts = decompose.decompose_instructions(cur_game_state,instruction,active_player)
        instr_parts.forEach(function(part){
            //change local game state
            consume.consume_change(cur_game_state,part)
        })
        active_player = cur_game_state.players.active_player
        if(instruction.type === "END_TURN" || instruction.type === "GAME_STARTED"){
            state_list.push({
                state: clib.deep_copy(cur_game_state),
                instrs: state_instr_list,
            })
            state_instr_list = []
        }
        else if(record[record.length-1] === instruction){
            state_list.push({
                state: clib.deep_copy(cur_game_state),
                instrs: state_instr_list,
            })
            state_instr_list = []
        }
        else{
            state_instr_list.push(instruction)
        }
    })
    return state_list
}
function map_to_state_changes(game_state){
    var state_change_signals =  [{type:"CLEAR"}]
    clib.all_coords(game_state).forEach(function(coord){
        if(clib.is_unit(game_state.map,coord)){
            var unit = clib.at(game_state.map,coord)
            state_change_signals.push({
                type:"CREATE",
                data:unit,
                coord: coord,
            })
            unit.attachments.forEach(function(attach){
                state_change_signals.push({
                    type: "ADD_EQUIPMENT",
                    coord: coord,
                    equip_type: attach,
                })
            })
        }
    })
    return state_change_signals
}
function current_nav_state(){
    return current_navigation_states[major_index].state
}
function save_analysis_choice(coordcen){

}
var current_navigation_states = []
var major_index = 0
function init_analysis_signals(record,game_state){
    signals.analysis_signal.listen(function(){
        current_navigation_states = process_instruction_record(record)
        console.log(record)
        console.log("current_navigation_states")
        console.log(current_navigation_states)
        major_index = current_navigation_states.length - 1
        draw_board(current_nav_state())
    })
    signals.stop_analysis_signal.listen(function(){
        draw_board(game_state)
    })
    signals.analysisClickOccurred.listen(function(coord){
        save_analysis_choice(coord)
    })
    signals.analysis_navigation.listen(handle_analysis_navigation)
}
function handle_analysis_navigation(nav_instr){
    switch(nav_instr){
        case "FAST_FORWARD": major_index = Math.min(major_index+1,current_navigation_states.length-1); break;
        case "FAST_BACKWARD": major_index = Math.max(major_index-1,0); break;
    }
    console.log(major_index)
    draw_board(current_nav_state())
}
function draw_board(game_state){
    map_to_state_changes(game_state).forEach(function(change){
        signals.gameStateChange.fire(change)
    })
    game_state.players.player_order.forEach(function(player){
        var money = game_state.players.player_info[player].money;
        signals.gameStateChange.fire({
            type: "SET_MONEY",
            amount: money,
            player: player,
        })
    })
}
module.exports = {
    //draw_board: draw_board,
    //process_instruction_record: process_instruction_record,
    init_analysis_signals: init_analysis_signals,
}
