var types = require("../logic_modules/types.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")
var base_inter = require("./game_display/base_component.js")
var signals = require("./game_display/global_signals.js")
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var init_game = require("../logic_modules/init_game.js")
var player_utils = require("./player_utils.js")
var game_page = require("./game_page.js")

function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function process_instruction_backend(game_state,instruction,player){
    var instr_parts = decompose.decompose_instructions(game_state,instruction,player)
    instr_parts.forEach(function(part){
        //change local game state
        consume.consume_change(game_state,part)
        //display instruction on canvas
        signals.gameStateChange.fire(part)
    })
}
function process_instruction(game_state,instruction,player){
    game_page.process_message_frontend(game_state,instruction,player,process_instruction_backend)
}
var player_frontend_data = {}
function init_player_frontend_data(player_order){
    var lib_data = document.getElementById("default_lib_src").innerHTML
    var data_data = JSON.parse(document.getElementById("default_data_src").innerHTML)
    var layout_data = JSON.parse(document.getElementById("default_layout_src").innerHTML)
    player_order.forEach(function(player){
        player_frontend_data[player] = {
            lib_data: lib_data,
            data_data: data_data,
            layout_data: layout_data,
        }
    })
}
function init_signals(game_state){
    signals.clear_all_signals()
    game_page.init_signals(game_state)
    signals.ended_turn.listen(() => {
        process_instruction_backend(game_state,{type:"END_TURN"},signals.myPlayer.getState())
        var myplayer = signals.myPlayer.getState()
        signals.libData.setState(player_frontend_data[myplayer].lib_data)
        signals.layoutChanged.setState(player_frontend_data[myplayer].layout_data)
        signals.buttonData.setState(player_frontend_data[myplayer].data_data)
    })
    signals.libData.listen(function(newstate){
        var myplayer = signals.myPlayer.getState()
        if(myplayer){
            player_frontend_data[myplayer].lib_data = newstate
        }
    })
    signals.layoutChanged.listen(function(newstate){
        var myplayer = signals.myPlayer.getState()
        if(myplayer){
            player_frontend_data[myplayer].layout_data = newstate
        }
    })
    signals.buttonData.listen(function(newstate){
        var myplayer = signals.myPlayer.getState()
        if(myplayer){
            player_frontend_data[myplayer].data_data = newstate
        }
    })
    signals.activePlayer.listen(function(newstate){
        signals.myPlayer.setState(newstate)
    })
}
function execute_init_instr(gamesize,game_state){
    var player_order = player_utils.example_player_state.player_order
    var init_instr = {
        type: "GAME_STARTED",
        game_size: gamesize,
        initial_creations: init_game.place_initial_units(gamesize,player_order),
        player_order: player_order,
        initial_money: 500,
        stats: types.default_stats,
    }
    process_instruction(game_state,init_instr,"__server")
}
function create_single_player(){
    var gamesize = {
        xsize: 15,
        ysize: 10,
    }
    var game_state = {
        players: null,
        map: null,
        stats: null,
    }
    init_player_frontend_data(player_utils.example_player_state.player_order)
    init_signals(game_state)

    game_page.set_worker_callback(function(message){
        process_instruction(game_state,message,signals.myPlayer.getState())
    })
    game_page.init_html_ui(gamesize,player_utils.example_player_state.player_order)
    game_page.init_web_worker()
    execute_init_instr(gamesize,game_state)
    game_page.switch_to_game_page()
}

module.exports = {
    create_single_player: create_single_player,
}
