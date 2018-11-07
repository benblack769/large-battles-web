var load_images = require("./load_images.js")
var game_types = require("../logic_modules/types.js")
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
function init_single_player(){
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
    }
    var init_units_messages = init_game.place_initial_units(gamesize,mystate.players_order)

    init_units_messages.forEach(function(part){
        //change local game state
        consume.consume_change(game_state,part)
    })
    load_images.on_load_all_images(game_types.get_all_sources(),function(){
        var base = new GameInterface(null, basediv, gamesize, mystate.players_order)
        player_utils.init_player_interface(mystate,"ben's player","ben's player")
        //init canvas positions
        init_units_messages.forEach(function(part){
            //display message on canvas
            signals.gameStateChange.fire(part)
        })
    })
    signals.clickCycleFinished.listen(function(clicks){
        process_clicks(clicks, signals.selectedData.getState().click_num)
    })
    signals.ended_turn.listen(() => {
        player_utils.turn_ended(mystate)
        signals.myPlayer.setState(signals.activePlayer.getState())
    })
    signals.selectedData.listen(function(data){
        console.log(data)
        my_web_worker.postMessage({
            type: "REPLACE_FUNCTION",
            js_str: data.js_file,
        })
    })
    my_web_worker.onmessage = function(message){
        var message = message.data

        //validate message
        var error = validate.validate_instruction(game_state,message)
        if(error){
            console.log("ERROR "+error.name+": \n"+error.message)
            return
        }
        console.log(message)
        var instr_parts = decompose.decompose_instructions(game_state,message)
        instr_parts.forEach(function(part){
            //change local game state
            consume.consume_change(game_state,part)
            //display message on canvas
            signals.gameStateChange.fire(part)
        })
        //relay message to server
    }
    /*var obj = JSON.stringify({
        hithere: 123,
        bob: "green"
    },null,4)
    make_change_script_popup(obj,JSON.parse,function(res_val){
        console.log(res_val)
    })*/
}

module.exports = {
    switch_to_single_player: switch_to_single_player,
    init_single_player: init_single_player,
}
