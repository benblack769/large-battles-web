var load_images = require("./load_images.js")
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

var my_web_worker = new Worker("web_worker.js");

function switch_to_single_player(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
    window.scrollTo(80, 40);
    document.body.style["background-color"] = "gray"
}
function switch_away_from_single_player(){
    document.body.style["background-color"] = "white"
}

class GameInterface extends base_inter.BaseComponent {
    constructor(parent,basediv,gamesize,init_player_state){
        super(parent,basediv)
        this.gameboard = new canv_inter.GameBoard(this,basediv,gamesize)
        this.script_inter = new script_inter.ScriptInterface(this,(basediv))
        this.player_info = new script_inter.PlayerInfoPannel(this,basediv,init_player_state)
    }
    children(){
        return [this.gameboard, this.script_inter]
    }
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function process_instruction(game_state,instruction,player){
    //validate instruction
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
            return
        }
        console.log(instruction)
        var instr_parts = decompose.decompose_instructions(game_state,instruction,player)
        instr_parts.forEach(function(part){
            //change local game state
            consume.consume_change(game_state,part)
            //display instruction on canvas
            signals.gameStateChange.fire(part)
        })
    }
}
function init_signals(game_state){
    signals.ended_turn.listen(() => {
        process_instruction(game_state,{type:"END_TURN"},signals.myPlayer.getState())
    })
    signals.clickOccurred.listen((coord) => {
        my_web_worker.postMessage({
            type: "CLICK_OCCURED",
            coord: coord,
            game_state: game_state,
            active_player: signals.activePlayer.getState(),
            my_player: signals.myPlayer.getState(),
        })
    })
    signals.selectedData.listen(function(data){
        console.log(data)
        my_web_worker.postMessage({
            type: "REPLACE_FUNCTION",
            json_data: data.json_data,
        })
    })
    signals.libData.listen(function(js_code){
        my_web_worker.postMessage({
            type: "REPLACE_LIBRARY",
            js_str: js_code,
        })
        //signals.selectedData.setState(signals.selectedData.getState())
    })
    signals.gameStateChange.listen(function(instr){
        if(instr.type === "SET_ACTIVE_PLAYER"){
            signals.activePlayer.setState(instr.player)
            signals.myPlayer.setState(signals.activePlayer.getState())
        }
    })
}
function init_web_worker(){
    $.get("default_lib.js",function(data){
        ///console.log(data)
        signals.libData.setState(data)
    },"text")
}
function main_init(){
    var basediv = document.getElementById("single_page_game_overlay")
    var gamesize = {
        xsize: 30,
        ysize: 20,
    }
    var game_state = {
        players: null,
        map: null,
        stats: null,
    }
    var player_order = player_utils.example_player_state.player_order
    var init_instr = {
        type: "GAME_STARTED",
        game_size: gamesize,
        initial_creations: init_game.place_initial_units(gamesize,player_order),
        player_order: player_order,
        initial_money: 500,
        stats: types.default_stats,
    }
    init_signals(game_state)
    //var init_units_messages = init_game.place_initial_units(gamesize,mystate.player_order)

    my_web_worker.onmessage = function(message){
        var message = message.data
        process_instruction(game_state,message,signals.myPlayer.getState())
    }
    var base = new GameInterface(null, basediv, gamesize, player_order)
    process_instruction(game_state,init_instr,"__server")
    init_web_worker()
    var default_layout = document.getElementById("default_layout_src").innerHTML
    console.log("default_layout")
    //console.log(default_layout)
    signals.layoutChanged.setState(JSON.parse(default_layout))
}
function init_single_player(){
    load_images.on_load_all_images(types.get_all_sources(),main_init)
}

module.exports = {
    switch_to_single_player: switch_to_single_player,
    init_single_player: init_single_player,
    switch_away_from_single_player: switch_away_from_single_player,
}
