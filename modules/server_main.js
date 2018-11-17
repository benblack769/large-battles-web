const WebSocket = require('ws');
var init_game = require("./logic_modules/init_game.js")
var decompose_instr = require("./logic_modules/decompose_instructions.js").decompose_instructions
var consume_instr = require("./logic_modules/consume_instructions.js").consume_change
var validate = require("./logic_modules/validate_instruction.js")
var types = require("./logic_modules/types.js")


console.assert(process.argv.length >= 7, "needs 3 command line arguments, port, unique_game_id, p1_username, p2_username, p1_password, p2_password")

const port_num = process.argv[2]
const unique_game_id = process.argv[3]
const player1_username = process.argv[4]
const player2_username = process.argv[5]
const player1_password = process.argv[6]
const player2_password = process.argv[7]

var player_sockets = {}

var players_connected = 0;
var game_started = false;

console.log('listening on port: '+port_num)

const wss = new WebSocket.Server({
    port: port_num,
})
function consume_player_instr(game_state,instr,player){
    var instr_parts = decompose_instr(game_state,instr,player)
    instr_parts.forEach(function(part){
        consume_instr(game_state,part)
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
        xsize: 20,
        ysize: 10,
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
        initial_money: 500,
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
    Object.values(player_sockets).forEach(function(socket){
        socket.send(JSON.stringify({
            type:"GAME_DISCONNECTED",
        }))
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
      else{
          console.log("bad message parsed" + data)
      }
  })
});
