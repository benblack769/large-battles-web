var types = require("../logic_modules/types.js")
var signals = require("./game_display/global_signals.js")
var info_display = require("./game_display/info_display.js")
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var init_game = require("../logic_modules/init_game.js")
var signup_login = require("./signup_login.js")
var game_page = require("./game_page.js")
var nav_signal = require("./nav_signal.js")

var server_socket = null

function init_game_interface(game_state,started_instr){
    init_signals(game_state)
    init_web_worker(game_state)
    game_page.init_html_ui(started_instr.game_size,started_instr.player_order)
    var creds = signup_login.get_credentials()
    signals.myPlayer.setState(creds.username)
    signals.selectedData.setState(signals.selectedData.getState())
    nav_signal.change_page.fire("game_naventry")
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
function process_instruction_backend(game_state,instruction,player){
    //validate instruction
    var error = validate.validate_instruction(game_state,instruction,player)
    if(error){
        console.log("SERVER SENT BAD MESSAGE!!!"+error.name+": \n"+error.message)
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
    console.log("sent instr:")
    console.log(JSON.stringify(instr,null,2))
    server_socket.send(JSON.stringify(instr))
}
function init_signals(game_state){
    signals.clear_all_signals()
    game_page.init_signals(game_state)
    signals.ended_turn.listen(() => {
        send_instruction({type:"END_TURN"})
    })
    signals.gameStateChange.listen(function(change){
        if(change.type === "VICTORY"){
            if(change.win_player === signals.myPlayer.getState()){
                info_display.make_info_display("You won!")
            }
            else{
                info_display.make_info_display("You lost. Winner: '"+change.win_player+"'")
            }
        }
    })
}
function init_web_worker(game_state){
    game_page.init_web_worker()
    game_page.set_worker_callback(function(message){
        game_page.process_message_frontend(game_state,message,signals.myPlayer.getState(),function(g,message,p){
            send_instruction(message)
        })
    })
}
function on_server_message(data,game_state){
    switch(data.type){
        case "ERROR_MSG": console.log("server error:");console.log(data); break;
        case "VALIDATED_INSTR": process_instruction_backend(game_state,data.instr,data.player); break;
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
}
module.exports = {
    setup_multiplayer_connection: setup_multiplayer_connection,
}
