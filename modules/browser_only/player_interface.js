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
//var Analysis = require("./analysis.js").Analysis
var interaction_comps = require("./game_display/interaction_components.js")
var init_ai = require("./init_ai.js")
var analysis_ui = require("./analysis_ui.js")

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
        this.player_info = new script_inter.PlayerInfoPannel(this,basediv,init_player_state,signals,false)
        this.unit_info = new script_inter.UnitInfoPannel(this,basediv,signals)
        this.ai_recomend = new script_inter.AIRecomendations(this,basediv,signals)
    }
}

var single_player_players = [
    "Player A",
    "Player B",
]

function process_instruction_backend(game_state,instruction,player,signals){
    var old_state = clib.deep_copy(game_state)
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
    signals.prev_game_state.setState(old_state)
    signals.game_state_changed.fire(game_state)
}
function process_instruction(game_state,game_record,instruction,player,signals){
    process_message_frontend(game_state,game_record,instruction,player,process_instruction_backend,signals)
}
class MainGame {
    constructor(basediv){
        var signals = new all_signals()
        var game_state = {}
        this.basediv = basediv
        this.signals = signals
        this.game_state = game_state
        this.game_record = []
    }
    on_init(initial_instr){
        this.init_signals_single_player(this.game_state,this.game_record,this.signals)
        this.ui = init_html_ui(this.basediv,initial_instr.game_size,initial_instr.player_order,this.signals)
        init_buttons(this.basediv,this.signals)
        this.single_in(initial_instr,"__server")

        this.signals.selectedData.setState(this.signals.selectedData.getState())
        init_ai.delayed_init_main_ai(this.signals,this.game_state)
    }
    single_in(instr,player){
        process_instruction(this.game_state,this.game_record,instr,player,this.signals)
    }
    single_out(instr){
        console.assert("not implemented")
    }
    init_signals_single_player(game_state,game_record,signals){
        var interaction_handler = new interaction_comps.InterfaceHandler(signals);
        signals.clickOccurred.listen((coord) => {
            interaction_handler.handle_click(coord,game_state,signals.myPlayer.getState())
        })
        signals.selectedData.listen((id) => {
            console.log(id+" selected")
            interaction_handler.set_fn(id,game_state,signals.myPlayer.getState())
        })
        signals.gameStateChange.listen((instr) => {
            if(instr.type === "SET_ACTIVE_PLAYER"){
                signals.activePlayer.setState(instr.player)
            }
        })
        signals.ended_turn.listen(() => {
            var instr = {type:"END_TURN"}
            this.single_out(instr,signals.myPlayer.getState())
        //    signals.selectedData.setState(signals.selectedData.getState())
        })
        signals.activePlayer.listen((newstate) => {
            signals.myPlayer.setState(newstate)
        })
        signals.gameStateChange.listen((change) => {
            if (change.type === "VICTORY") {
                info_display.make_info_display("Player: '" +change.win_player+"' won the game.")
            }
        })
        signals.interfaceInstruction.listen((message)=>{
            this.single_out(message,signals.myPlayer.getState())
        })
        signals.mouse_hover.listen((xycoord) => {
            var unit_info = clib.deep_copy(clib.at(game_state.map,xycoord))
            if(unit_info === "E"){
                unit_info = {
                    category: "E"
                }
            }
            unit_info.coord = xycoord
            signals.display_unit_info.fire(unit_info)
        })
        signals.follow_ai_move.listen(() => {
            var instr = signals.ai_recomended_move.getState()
            console.log("ai instr")
            console.log(instr)
            if(instr){
                this.single_out(instr,signals.myPlayer.getState())
                signals.ai_start_recomendation.fire()
            }
            else{
                alert("no instruction to follow")
            }
        })
    }
}

class SinglePlayerGame extends MainGame {
    constructor(basediv,initial_instr){
        super(basediv)
        this.on_init(initial_instr)
    }
    single_out(instr,player){
        this.single_in(instr,player)
    }
}

module.exports = {
    MainGame: MainGame,
    SinglePlayerGame: SinglePlayerGame,
}
