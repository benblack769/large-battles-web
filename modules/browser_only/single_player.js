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

var my_web_worker = new Worker("web_worker.js")

function switch_to_single_player(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
    window.scrollTo(80, 40);
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
function process_clicks(clicks, click_num){
    my_web_worker.postMessage({
        type: "ACTIVATE_FUNCTION",
        args: clicks,
    })
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function process_instruction(game_state,instruction,player){
    //validate instruction
    var error = validate.validate_instruction(game_state,instruction,player)
    if(error){
        console.log("ERROR "+error.name+": \n"+error.message)
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
    //relay instruction to server
}
function init_signals(game_state){
    signals.clickCycleFinished.listen(function(clicks){
        process_clicks(clicks, signals.selectedData.getState().click_num)
    })
    signals.ended_turn.listen(() => {
        process_instruction(game_state,{type:"END_TURN"},signals.myPlayer.getState())
    })
    signals.selectedData.listen(function(data){
        console.log(data)
        my_web_worker.postMessage({
            type: "REPLACE_FUNCTION",
            js_str: data.js_file,
        })
    })
    signals.gameStateChange.listen(function(instr){
        if(instr.type === "SET_ACTIVE_PLAYER"){
            signals.activePlayer.setState(instr.player)
            signals.myPlayer.setState(signals.activePlayer.getState())
        }
    })
}
function main_init(){
    var basediv = document.getElementById("single_page_game_overlay")
    var gamesize = {
        xsize: 30,
        ysize: 20,
    }
    var mystate = player_utils.example_player_state
    var map = init_game.init_map(gamesize)
    var game_state = {
        players: mystate,
        map: map,
        stats: types.default_stats,
    }
    init_signals(game_state)
    var init_units_messages = init_game.place_initial_units(gamesize,mystate.players_order)

    my_web_worker.onmessage = function(message){
        var message = message.data
        process_instruction(game_state,message,signals.myPlayer.getState())
    }
    var base = new GameInterface(null, basediv, gamesize, mystate.players_order)
    player_utils.init_player_interface(mystate,"ben's player","ben's player")
    //init canvas positions
    init_units_messages.forEach(function(part){
        //display message on canvas
        signals.gameStateChange.fire(part)
        consume.consume_change(game_state,part)
    })

    /*var obj = JSON.stringify({
        hithere: 123,
        bob: "green"
    },null,4)
    make_change_script_popup(obj,JSON.parse,function(res_val){
        console.log(res_val)
    })*/
}
function init_single_player(){
    load_images.on_load_all_images(types.get_all_sources(),main_init)
}

module.exports = {
    switch_to_single_player: switch_to_single_player,
    init_single_player: init_single_player,
}
