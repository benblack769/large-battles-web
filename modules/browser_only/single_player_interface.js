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
var MainAI = require("../logic_modules/ai_interface/main_ai_inter.js").MainAI
var ai_type_utils = require("../logic_modules/ai_interface/type_utils.js")
var flatten = require("../logic_modules/ai_interface/ai_utils.js").flatten

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
        this.ai_recomend = new script_inter.AIRecomendations(this,basediv,signals)
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
    signals.ai_start_recomendation.fire()
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
    signals.follow_ai_move.listen(function(){
        var instr = signals.ai_recomended_move.getState()
        console.log("ai instr")
        console.log(instr)
        if(instr){
            process_instruction(game_state,game_record,instr,signals.myPlayer.getState(),signals)
        }
        else{
            alert("no instruction to follow")
        }
    })
}

function to_high_color(propmax){
    return "rgba(255,0,0,"+(propmax*0.5)+")"
}
function val_map_to_highlights(prob_map){
    var flat_probs = flatten(prob_map)
    var max = Math.max.apply(null,flat_probs)
    var highlight_list = []
    for(var y = 0; y < prob_map.length; y++){
        for(var x = 0; x < prob_map[y].length; x++){
            var color = to_high_color(prob_map[y][x] / max)
            var coord = {x:x,y:y}
            highlight_list.push({
                coord:coord,
                color:color,
            })
        }
    }
    return {
        draw_list: highlight_list,
        line_list: [],
    }
}
function init_main_ai(signals,game_state){
    var train_myplayer = 'chromeuser'
    var record_1 = JSON.parse(document.getElementById("long_game_record").innerHTML)
    var record_2 = JSON.parse(document.getElementById("other_long_game_record").innerHTML)
    var records = [record_1]
    var main_ai = new MainAI(records,train_myplayer)
    signals.ai_start_recomendation.listen(function(){
        signals.ai_recomended_move.setState(null)
        var myplayer = signals.myPlayer.getState()
        if(main_ai.is_trained()){
            main_ai.get_recomended_instr(game_state,myplayer,function(recomended){
                signals.ai_recomended_move.setState(recomended)
            })
        }
    })
    signals.ai_recomended_move.listen(function(instr){
        if(instr){
            var major_coord = ai_type_utils.major_coord(instr)
            var minor_coord = ai_type_utils.minor_coord(instr)
            var color_major = "rgba(128,128,128,0.4)"
            var color_minor = "rgba(255,0,0,0.4)"
            function to_item(coord,color){
                return {
                    coord: coord,
                    color: color,
                }
            }
            function to_line(c1,c2){
                return {
                    coord1: c1,
                    coord2: c2,
                }
            }
            if(minor_coord){
                var message = {
                    draw_list: [to_item(major_coord,color_major),to_item(minor_coord,color_minor)],
                    line_list: [to_line(minor_coord,major_coord)],
                }
            }
            else{
                var message = {
                    draw_list: [to_item(major_coord,color_major)],
                    line_list: [],
                }
            }
            signals.highlightCommand.fire(message)
        }
        else{
            signals.clear_highlights.fire()
        }
    })
    signals.ai_start_major_move_display.listen(function(){
        var myplayer = signals.myPlayer.getState()
        main_ai.get_prob_map(game_state,myplayer,function(prob_map){
            var highlights = val_map_to_highlights(prob_map)

            signals.highlightCommand.fire(highlights)
        })
    })
    return main_ai
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
        //init_main_ai(signals,game_state)
    }
}

module.exports = {
    SinglePlayerGame: SinglePlayerGame,
}
