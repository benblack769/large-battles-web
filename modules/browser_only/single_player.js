var types = require("../logic_modules/types.js")
var info_display = require("./game_display/info_display.js")
var signals = require("./game_display/global_signals.js")
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var init_game = require("../logic_modules/init_game.js")
var game_page = require("./game_page.js")
var nav_signal = require("./nav_signal.js")

var single_player_players = [
    "Player A",
    "Player B",
]

function process_instruction_backend(game_state,instruction,player){
    var instr_parts = decompose.decompose_instructions(game_state,instruction,player)
    instr_parts.forEach(function(part){
        //change local game state
        consume.consume_change(game_state,part)
        //display instruction on canvas
        signals.gameStateChange.fire(part)
    })
    if(instruction.type === "END_TURN"){
        signals.selectedData.setState(signals.selectedData.getState())
    }
}
function process_instruction(game_state,instruction,player){
    game_page.process_message_frontend(game_state,instruction,player,process_instruction_backend)
}
function init_signals(game_state){
    signals.clear_all_signals()
    game_page.init_signals(game_state)
    signals.ended_turn.listen(() => {
        process_instruction_backend(game_state,{type:"END_TURN"},signals.myPlayer.getState())
    //    signals.selectedData.setState(signals.selectedData.getState())
    })
    signals.activePlayer.listen(function(newstate){
        signals.myPlayer.setState(newstate)
    })
    signals.gameStateChange.listen(function(change){
        if (change.type === "VICTORY") {
            info_display.make_info_display("Player: '" +change.win_player+"' won the game.")
        }
    })
    signals.interfaceInstruction.listen(function(message){
        process_instruction(game_state,message,signals.myPlayer.getState())
    })
}
function execute_init_instr(gamesize,game_state){
    var player_order = single_player_players
    var init_instr = {
        type: "GAME_STARTED",
        game_size: gamesize,
        initial_creations: init_game.place_initial_units(gamesize,player_order),
        player_order: player_order,
        initial_money: 100,
        stats: types.default_stats,
    }
    process_instruction(game_state,init_instr,"__server")
    signals.selectedData.setState(signals.selectedData.getState())
}
function create_single_player(){
    var gamesize = {
        xsize: 45,
        ysize: 40,
    }
    var game_state = {
        players: null,
        map: null,
        stats: null,
    }
    init_signals(game_state)

    game_page.init_html_ui(gamesize,single_player_players)
    execute_init_instr(gamesize,game_state)
    nav_signal.change_page.fire("game_naventry")
}

module.exports = {
    create_single_player: create_single_player,
}
