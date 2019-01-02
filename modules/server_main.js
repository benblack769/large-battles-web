const WebSocket = require('ws');
var request = require('request')
var init_game = require("./logic_modules/init_game.js")
var decompose_instr = require("./logic_modules/decompose_instructions.js").decompose_instructions
var consume_instr = require("./logic_modules/consume_instructions.js").consume_change
var validate = require("./logic_modules/validate_instruction.js")
var types = require("./logic_modules/types.js")
const fs = require('fs');



console.assert(process.argv.length >= 7, "needs 3 command line arguments, port, unique_game_id, p1_username, p2_username, p1_password, p2_password")

const port_num = process.argv[2]
const unique_game_id = process.argv[3]
const player1_username = process.argv[4]
const player2_username = process.argv[5]
const player1_password = process.argv[6]
const player2_password = process.argv[7]

var full_validated_instruction_list = []

var player_sockets = {}

var players_connected = 0;
var game_started = false;

console.log('listening on port: '+port_num)

const wss = new WebSocket.Server({
    port: port_num,
})

function make_results(p1_res,p2_res){
    return [
        {
            username:player1_username,
            winrecord:p1_res,
        },
        {
            username:player2_username,
            winrecord:p2_res,
        }
    ]
}
function make_winner_results(win_name){
    if(win_name === player1_username){
        return make_results("victory","defeat")
    }
    else if(win_name === player2_username){
        return make_results("defeat","victory")
    }
    else{
        throw new Error("bad winner")
    }
}
function get_folder_to_save(){
    return "../game_records/"+unique_game_id+".json"
}
function save_game_log(){
    fs.writeFileSync(get_folder_to_save(), JSON.stringify(full_validated_instruction_list,null,2));
}
function log_game_result(results){
    var req_options = {
        uri: 'http://localhost:8804/log_game_result',
        method: 'POST',
        json: {
            "game_id": unique_game_id,
            "results": results,
        }
    };

    request(req_options, function (error, response, body) {
        if(error){
            console.log(error)
        }
        else if (response.statusCode != 200) {
            console.log("log reqeust status"+response.statusCode)
            console.log(body)
        }
        else{
            console.log("successfully logged results")
            console.log(results)
        }
        save_game_log()
        safe_process_exit()
    });
}
function consume_player_instr(game_state,instr,player){
    var instr_parts = decompose_instr(game_state,instr,player)
    instr_parts.forEach(function(part){
        consume_instr(game_state,part)
        if(part.type === "VICTORY"){
            log_game_result(make_winner_results(part.win_player))
        }
    })
}
function disperse_instruction(game_state,instr,player){
    Object.values(player_sockets).forEach(function(client){
        client.send(JSON.stringify({
            type: "VALIDATED_INSTR",
            player: player,
            instr: instr,
        }))
    })
    full_validated_instruction_list.push(instr)
    consume_player_instr(game_state,instr,player)
}
function handle_player_message(game_state,message,player_id){
    var error = validate.validate_instruction(game_state,message,player_id)
    if(error){
        player_sockets[player_id].send(JSON.stringify({
            'type': "ERROR_MSG",
            'name': error.name,
            'message': error.message,
            'orig_message': message,
        }))
    }
    else{
        disperse_instruction(game_state,message,player_id)
    }
}
function start_game(){
    var game_size = {
        xsize: 35,
        ysize: 35,
    }
    var game_state = {
        map: null,
        players: null,
        stats: null
    };
    var player_order = [player1_username,player2_username]
    var init_instr = {
        type: "GAME_STARTED",
        game_size: game_size,
        initial_creations: init_game.place_initial_units(game_size,player_order),
        player_order: player_order,
        initial_money: 100,
        stats: types.default_stats,
    }
    disperse_instruction(game_state,init_instr,"__server")

    player_sockets[player1_username].on('message',function(message){
        handle_player_message(game_state,JSON.parse(message),player1_username)
    })
    player_sockets[player2_username].on('message',function(message){
        handle_player_message(game_state,JSON.parse(message),player2_username)
    })
}
function verify_player(player_credentials){
    if(player_credentials.username === player1_username &&
        player_credentials.password === player1_password){
            return player1_username;
    }
    else if(player_credentials.username === player2_username &&
        player_credentials.password === player2_password){
            return player2_username;
    }
    else{
        return null;
    }
}
function game_disconnected(){
    log_game_result(make_results("disconnect","disconnect"))
}
function safe_process_exit(){
    Object.values(player_sockets).forEach(function(socket){
        socket.close()
    })
    process.exit()
}
function init_player(player_socket, player_id){
    players_connected++;
    player_socket.player_id = player_id
    player_sockets[player_id] = player_socket
    player_socket.on('close',function(){
        game_disconnected()
    })
    if(players_connected >= 2){
        start_game()
    }
}

wss.on('connection', function (socket, req) {
  console.log("connected to client")
  socket.on('message', function(message){
      console.log(message)
      var data = JSON.parse(message)
      if(data.type === "CREDENTIALS"){
          var player_id = verify_player(data)
          if(player_id){
              console.log("player "+player_id+" logged in")
              init_player(socket, player_id)
          }
          else{
              console.log("bad credential connection closed")
              socket.close()
          }
      }
  })
});
