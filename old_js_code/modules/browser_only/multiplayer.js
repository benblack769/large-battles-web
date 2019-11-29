var types = require("../logic_modules/types.js")
var all_signals = require("./game_display/global_signals.js").all_signals
var info_display = require("./game_display/info_display.js")
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var init_game = require("../logic_modules/init_game.js")
var signup_login = require("./signup_login.js")
var game_page = require("./game_page.js")
var nav_signal = require("./nav_signal.js")
var MainGame = require("./player_interface.js").MainGame


function init_game_interface(game_state,started_instr,signals){
    init_signals(game_state,signals)
    game_page.init_html_ui(started_instr.game_size,started_instr.player_order,signals)
    var creds = signup_login.get_credentials()
    signals.myPlayer.setState(creds.username)
    signals.selectedData.setState(signals.selectedData.getState())
    nav_signal.change_page.fire("game_naventry")
}
function validate_websocket_instruction(game_state,instr,player){
    var error = validate.validate_instruction(game_state,instr,player)
    if(error){
        console.log("ERROR "+error.name+": \n"+error.message)
        if(error.name !== "Error") {
            console.log(error)
        }
        return false
    }
    return true
}
function process_instruction_backend(game_state,instruction,player,signals){
    //validate instruction
    var error = validate.validate_instruction(game_state,instruction,player)
    if(error){
        console.log("SERVER SENT BAD MESSAGE!!!"+error.name+": \n"+error.message)
    }
    if(instruction.type === "GAME_STARTED"){
        init_game_interface(game_state,instruction,signals)
    }
    console.log(instruction)
    var instr_parts = decompose.decompose_instructions(game_state,instruction,player)
    instr_parts.forEach(function(part){
        //change local game state
        consume.consume_change(game_state,part)
        //display instruction on canvas
        signals.gameStateChange.fire(part)
    })

    if(instruction.type === "END_TURN" || instruction.type === "GAME_STARTED"){
        signals.selectedData.setState(signals.selectedData.getState())
    }
    signals.game_state_changed.fire(game_state)
}
function send_instruction(instr){
    console.log("sent instr:")
    console.log(JSON.stringify(instr,null,2))
    server_socket.send(JSON.stringify(instr))
}
function init_signals(game_state,signals){
    game_page.init_signals(game_state,signals)
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
    signals.interfaceInstruction.listen(function(message){
        game_page.process_message_frontend(game_state,message,signals.myPlayer.getState(),function(g,message,p){
            send_instruction(message)
        },signals)
    })
}
function on_server_message(data,game_state,signals){
    switch(data.type){
        case "ERROR_MSG": console.log("server error:");console.log(data); break;
        case "VALIDATED_INSTR": process_instruction_backend(game_state,data.instr,data.player,signals); break;
        case "GAME_DISCONNECTED": break;
    }
}


class MultiPlayerGame extends MainGame {
    constructor(basediv,server_url){
        super(basediv)
        this.server_socket = new WebSocket(server_url)


        this.server_socket.onclose = (e) => {
            console.log('Disconnected from game server!');
            alert('Disconnected from game server!');
        };
        this.server_socket.onopen = ()=>{
            var creds = signup_login.get_credentials()
            this.server_socket.send(JSON.stringify({
                type: "CREDENTIALS",
                password: creds.password,
                username: creds.username,
            }))
            console.log("socket opened argvar")
            this.server_socket.onmessage = (message)=>{
                var data = JSON.parse(message.data)
                console.log(data)
                this.on_server_message(data)
            }
        }
    }
    on_init(init_instr){
        super.on_init(init_instr)
        $("#game_not_started_message").hide()
        nav_signal.change_page.fire("game_naventry")
    }
    //single_in(instr,player){
    //    process_instruction(this.game_state,this.game_record,instr,player,this.signals)
    //}
    single_out(instr,player){
        if(instr.type !== "DRAW_RECTS"){
            this.server_socket.send(JSON.stringify(instr))
        }
        //this.single_in(instr,player)
    }
    on_server_message(data){
        switch(data.type){
            case "ERROR_MSG": console.log("server error:");console.log(data); break;
            case "VALIDATED_INSTR":
                if(data.instr.type === "GAME_STARTED"){
                    this.on_init(data.instr)
                }
                else{
                    this.single_in(data.instr,data.player);
                }
                break;
            case "GAME_DISCONNECTED": break;
        }
    }
}

function setup_multiplayer_connection(server_url){
    //var basediv = document.getElementById("single_page_game_overlay")
    //var game = new MultiPlayerGame(basediv,server_url)
    //return
    server_socket = new WebSocket(server_url)
    var creds = signup_login.get_credentials()
    var game_state = {
        map:null,
        stats:null,
        players:null,
    }
    var signals = new all_signals()

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
            on_server_message(data,game_state,signals)
        }
    }
}
module.exports = {
    setup_multiplayer_connection: setup_multiplayer_connection,
}
