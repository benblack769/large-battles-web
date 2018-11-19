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
var signup_login = require("./signup_login.js")

function make_worker(){
    var data = document.getElementById("web_worker_src").innerHTML
    var blob = new Blob([data], { type: "text/javascript" })
    var url = window.URL.createObjectURL(blob)
    return new Worker(url)
}
var my_web_worker = make_worker();
var server_socket = null

function switch_to_multi_player(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
    window.scrollTo(80, 40);
    document.body.style["background-color"] = "gray"
}
function switch_away_from_multi_player(){
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
function init_game_interface(game_state,started_instr){
    init_web_worker(game_state)
    var basediv = document.getElementById("single_page_game_overlay")
    var base = new GameInterface(null, basediv, started_instr.game_size, started_instr.player_order)
    $.get("default_layout.json",function(layout){signals.layoutChanged.setState(layout)},"json")
    var creds = signup_login.get_credentials()
    signals.myPlayer.setState(creds.username)
}
function validate_websocket_instruction(game_state,instr,player){
    var error = validate.validate_instruction(game_state,instr,player)
    if(error){
        console.log("ERROR "+error.name+": \n"+error.message)
        if(error.name !== "Error"){
            console.log(error)
        }
        return false
    }
    return true
}
function process_instruction(game_state,instruction,player){
    //validate instruction
    var error = validate.validate_instruction(game_state,instruction,player)
    if(error){
        console.log("ERROR "+error.name+": \n"+error.message)
        if(error.name !== "Error"){
            console.log(error)
        }
        return
    }
    if(instruction.type === "GAME_STARTED"){
        init_game_interface(game_state,instruction)
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
function send_instruction(instr){
    server_socket.send(JSON.stringify(instr))
}
function init_signals(game_state){
    signals.ended_turn.listen(() => {
        send_instruction({type:"END_TURN"})
    })
    signals.clickOccurred.listen((coord) => {
        my_web_worker.postMessage({
            type: "CLICK_OCCURED",
            coord: coord,
            game_state: game_state,
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
        }
    })
}
function init_web_worker(game_state){
    $.get("default_lib.js",function(data){
        ///console.log(data)
        signals.libData.setState(data)
    },"text")

    my_web_worker.onmessage = function(message){
        var message = message.data

        if(message.type === "DRAW_RECTS"){
            signals.highlightCommand.fire(message)
        }
        else{
            if(validate_websocket_instruction(game_state,message,signals.myPlayer.getState())){
                send_instruction(message)
            }
        }
    }
}
function on_server_message(data,game_state){
    switch(data.type){
        case "ERROR_MSG": console.log("server error:");console.log(data); break;
        case "VALIDATED_INSTR": process_instruction(game_state,data.instr,data.player); break;
        case "GAME_DISCONNECTED": break;
    }
}
function setup_multiplayer_connection(server_url){
    server_socket = new WebSocket(server_url)
    var creds = signup_login.get_credentials()
    var game_state = {
        map:null,
        stats:null,
        players:null,
    }

    server_socket.onclose = function(e) {
        console.log('Disconnected from game server!');
    };
    server_socket.onopen = function(){
        server_socket.send(JSON.stringify({
            type: "CREDENTIALS",
            password: creds.password,
            username: creds.username,
        }))
        console.log("socket opened argvar")
        server_socket.onmessage = function(message){
            var data = JSON.parse(message.data)
            console.log(data)
            on_server_message(data,game_state)
        }
    }
    init_signals(game_state)
}
function init_multi_player(){
    load_images.on_load_all_images(types.get_all_sources(),function(){
        setup_multiplayer_connection("ws://localhost:9008")
    })
}

module.exports = {
    switch_to_multi_player: switch_to_multi_player,
    setup_multiplayer_connection: setup_multiplayer_connection,
    init_multi_player: init_multi_player,
    switch_away_from_multi_player: switch_away_from_multi_player,
}
