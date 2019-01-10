var types = require("../logic_modules/types.js")
var info_display = require("./game_display/info_display.js")
var all_signals = require("./game_display/global_signals.js").all_signals
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var init_game = require("../logic_modules/init_game.js")
var clib = require("../logic_modules/coord_lib.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")
//var game_page = require("./game_page.js")
var nav_signal = require("./nav_signal.js")
var Analysis = require("./analysis.js").Analysis
var interaction_comps = require("./game_display/interaction_components.js")
//var binary = require("../logic_modules/to_binary.js")



function set_player_colors(players_order,signals){
    var pcolors = {}
    var color_cycle = ["red","blue"]
    for(var i = 0; i < players_order.length; i++){
        pcolors[players_order[i]] = color_cycle[i]
    }
    signals.playerColors.setState(pcolors)
}

function init_buttons(basediv,signals){
    $(basediv).keyup(function(e) {
         if (e.key === "Escape" || e.keycode === 27) {
             signals.selectedData.setState(signals.selectedData.getState())
        }
    });
}

function init_signals(game_state,signals,game_record){
    var interaction_handler = new interaction_comps.InterfaceHandler(signals);
    signals.clickOccurred.listen((coord) => {
        interaction_handler.handle_click(coord,game_state,signals.myPlayer.getState())
    })
    signals.selectedData.listen(function(id){
        console.log(id+" selected")
        interaction_handler.set_fn(id,game_state,signals.myPlayer.getState())
    })
    signals.gameStateChange.listen(function(instr){
        if(instr.type === "SET_ACTIVE_PLAYER"){
            signals.activePlayer.setState(instr.player)
        }
    })
    var analysis = new Analysis(signals,game_record,game_state)
}

function init_html_ui(basediv,gamesize,player_order,signals){
    basediv.innerHTML = ""
    set_player_colors(player_order,signals)
    return new GameInterface(null, basediv, gamesize, player_order, signals)
}

function process_message_frontend(game_state,game_record,instruction,player,on_backend_message,signals){
    if(instruction.type === "DRAW_RECTS"){
        signals.highlightCommand.fire(instruction)
    }
    else{
        var error = validate.validate_instruction(game_state,instruction,player)
        if(error){
            console.log("ERROR "+error.name+": \n"+error.message)
            if(error.name !== "Error"){
                console.log(error)
            }
        }
        else{
            game_record.push(instruction)
            on_backend_message(game_state,instruction,player,signals)
        }
    }
}

class GameInterface {
    constructor(parent,basediv,gamesize,init_player_state,signals){
        this.gameboard = new canv_inter.GameBoard(this,basediv,gamesize,signals)
        this.script_inter = new script_inter.ScriptInterface(this,(basediv),signals)
        this.player_info = new script_inter.PlayerInfoPannel(this,basediv,init_player_state,signals)
        this.unit_info = new script_inter.UnitInfoPannel(this,basediv,signals)
    }
}

var single_player_players = [
    "Player A",
    "Player B",
]

function process_instruction_backend(game_state,instruction,player,signals){
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
function process_instruction(game_state,game_record,instruction,player,signals){
    process_message_frontend(game_state,game_record,instruction,player,process_instruction_backend,signals)
}
function init_signals_single_player(game_state,game_record,signals){
    init_signals(game_state,signals,game_record)
    signals.ended_turn.listen(() => {
        process_instruction(game_state,game_record,{type:"END_TURN"},signals.myPlayer.getState(),signals)
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
        process_instruction(game_state,game_record,message,signals.myPlayer.getState(),signals)
    })
    signals.mouse_hover.listen(function(xycoord){
        var unit_info = clib.deep_copy(clib.at(game_state.map,xycoord))
        if(unit_info === "E"){
            unit_info = {
                category: "E"
            }
        }
        unit_info.coord = xycoord
        signals.display_unit_info.fire(unit_info)
    })
}
class SinglePlayerGame{
    constructor(basediv,initial_instr){
        var signals = new all_signals()
        var game_state = {}
        this.basediv = basediv
        this.signals = signals
        this.game_state = game_state
        this.game_record = []

        init_signals_single_player(game_state,this.game_record,signals)
        this.ui = init_html_ui(basediv,initial_instr.game_size,initial_instr.player_order,signals)
        init_buttons(basediv,signals)

        process_instruction(game_state,this.game_record,initial_instr,"__server",signals)
        signals.selectedData.setState(signals.selectedData.getState())
    }
}

module.exports = {
    SinglePlayerGame: SinglePlayerGame,
}
