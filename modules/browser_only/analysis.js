var types = require("../logic_modules/types.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")
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
class Analysis {
    constructor(signals,record,game_state){
        this.signals = signals
        this.current_navigation_states = []
        this.major_index = 0
        this.init_analysis_signals(record,game_state)
    }
    current_nav_state(){
        return this.current_navigation_states[this.major_index].state
    }
    init_analysis_signals(record,game_state){
        this.signals.analysis_signal.listen(()=>{
            this.current_navigation_states = process_instruction_record(record)
            console.log(record)
            console.log("current_navigation_states")
            console.log(this.current_navigation_states)
            this.major_index = this.current_navigation_states.length - 1
            this.draw_board(this.current_nav_state())
        })
        this.signals.stop_analysis_signal.listen(()=>{
            this.draw_board(game_state)
        })
        this.signals.analysisClickOccurred.listen((coord)=>{
            //save_analysis_choice(coord)
        })
        this.signals.analysis_navigation.listen(this.handle_analysis_navigation.bind(this))
    }
    handle_analysis_navigation(nav_instr){
        switch(nav_instr){
            case "FAST_FORWARD": this.major_index = Math.min(this.major_index+1,this.current_navigation_states.length-1); break;
            case "FAST_BACKWARD": this.major_index = Math.max(this.major_index-1,0); break;
        }
        console.log(this.major_index)
        this.draw_board(this.current_nav_state())
    }
    draw_board(game_state){
        clib.map_to_state_changes(game_state).forEach((change)=>{
            this.signals.gameStateChange.fire(change)
        })
        game_state.players.player_order.forEach((player)=>{
            var money = game_state.players.player_info[player].money;
            this.signals.gameStateChange.fire({
                type: "SET_MONEY",
                amount: money,
                player: player,
            })
        })
    }
}
module.exports = {
    Analysis: Analysis,
}
