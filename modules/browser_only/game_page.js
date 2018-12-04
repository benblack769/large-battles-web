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
var nav_signal = require("./nav_signal.js")

function init_web_worker(){
    var lib_data = document.getElementById("default_lib_src").innerHTML
    signals.libData.setState(lib_data)
}
function make_worker(){
    var data = document.getElementById("web_worker_src").innerHTML
    var blob = new Blob([data], { type: "text/javascript" })
    var url = window.URL.createObjectURL(blob)
    return new Worker(url)
}
var my_web_worker = make_worker();

function set_worker_callback(onmessage_fn){
    my_web_worker.onmessage = function(message){
        onmessage_fn(message.data)
    }
}
function set_player_colors(players_order){
    var pcolors = {}
    var color_cycle = ["red","blue"]
    for(var i = 0; i < players_order.length; i++){
        pcolors[players_order[i]] = color_cycle[i]
    }
    signals.playerColors.setState(pcolors)
}
class GameInterface extends base_inter.BaseComponent {
    constructor(parent,basediv,gamesize,init_player_state){
        super(parent,basediv)
        this.gameboard = new canv_inter.GameBoard(this,basediv,gamesize)
        this.script_inter = new script_inter.ScriptInterface(this,(basediv))
        this.player_info = new script_inter.PlayerInfoPannel(this,basediv,init_player_state)
    }
}

function switch_to_game_page(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
    window.scrollTo(80, 40);
    document.body.style["background-color"] = "gray"
}
function switch_away_from_game_page(){
    document.body.style["background-color"] = "white"
}
function init_game_page(){
    $(document).keyup(function(e) {
         if (e.key === "Escape" || e.keycode === 27) {
             signals.selectedData.setState(signals.selectedData.getState())
        }
    });
    $("#goto_live_games").click(function(){
        nav_signal.change_page.fire("live_connect_naventry")
    })
}

function init_signals(game_state){
    signals.clickOccurred.listen((coord) => {
        my_web_worker.postMessage({
            type: "CLICK_OCCURED",
            coord: coord,
            game_state: game_state,
            my_player: signals.myPlayer.getState(),
        })
    })
    signals.selectedData.listen(function(id){
        console.log(id+" selected")
        my_web_worker.postMessage({
            type: "REPLACE_FUNCTION",
            function_id: id,
            game_state: game_state,
            my_player: signals.myPlayer.getState(),
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
        }
    })
    signals.selectorClicked.listen(function(selector_name){
        console.log("selector clicked with name: "+selector_name)
        my_web_worker.postMessage({
            type: "SELECTOR_CLICKED",
            selector_name: selector_name,
            game_state: game_state,
            my_player: signals.myPlayer.getState(),
        })
    })
    signals.buttonData.listen(function(buttondata){
        my_web_worker.postMessage({
            type: "DATA_CHANGED",
            data: buttondata,
        })
    })
}
function init_html_ui(gamesize,player_order){
    $(".player_info_bar").show()
    $("#game_not_started_message").hide()
    var basediv = document.getElementById("single_page_game_overlay")
    basediv.innerHTML = ""
    set_player_colors(player_order)
    var base = new GameInterface(null, basediv, gamesize, player_order)

    var default_layout = document.getElementById("default_layout_src").innerHTML
    signals.layoutChanged.setState(JSON.parse(default_layout))
    var default_data = document.getElementById("default_data_src").innerHTML
    signals.buttonData.setState(JSON.parse(default_data))
}

function process_message_frontend(game_state,instruction,player,on_backend_message){
    if(instruction.type === "DRAW_RECTS"){
        signals.highlightCommand.fire(instruction)
    }
    else if(instruction.type === "CHANGE_DATA"){
        var key = instruction.key
        var id = instruction.id
        var value = instruction.value
        var data = signals.buttonData.getState()
        data[id][key] = value
        signals.buttonData.setState(data)
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
            on_backend_message(game_state,instruction,player)
        }
    }
}
module.exports = {
    switch_away_from_game_page: switch_away_from_game_page,
    switch_to_game_page: switch_to_game_page,
    init_game_page: init_game_page,
    set_worker_callback: set_worker_callback,
    process_message_frontend: process_message_frontend,
    init_signals: init_signals,
    init_web_worker: init_web_worker,
    init_html_ui: init_html_ui,
}
