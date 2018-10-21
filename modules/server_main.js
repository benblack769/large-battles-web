const WebSocket = require('ws');
var request = require('request');

console.assert(process.argv.length >= 7, "needs 3 command line arguments, port, unique_game_id, p1_username, p2_username, p1_password, p2_password")

const port_num = process.argv[2]
const unique_game_id = process.argv[3]
const player1_username = process.argv[4]
const player2_username = process.argv[5]
const player1_password = process.argv[6]
const player2_password = process.argv[7]

var players_connected = 0;
var game_started = false;

const wss = new WebSocket.Server({
    port: port_num,
    //perMessageDeflate: false,
})
function randint(maxint){
    return Math.floor(Math.random() * maxint);
}
function get_result(guess_vals, act_val){
    if(Math.abs(guess_vals[1] - act_val) > Math.abs(guess_vals[2] - act_val)) {
        return 1
    }
    else{
        return 2
    }
}
function end_message(result,player_id){
    if(result === player_id){
        return "congratulations, you won!"
    }
    else{
        return "sorry, you lost..."
    }
}
function end_game(guess_vals, act_val){
    var result = get_result(guess_vals, act_val)
    wss.clients.forEach(function(client){
        if(client.player_id){
            client.send(JSON.stringify({
                type: "game_ended",
                result: end_message(result, client.player_id),
            }))
        }
    })
}
function start_game(){
    var actual_value = randint(100)
    console.log("actual value is: "+actual_value)
    var guess_values = {}
    wss.clients.forEach(function(client){
        if(client.player_id){
            client.send(JSON.stringify({
                "type": "game_started"
            }))
            client.on('message',function(message){
                console.log(message)
                message = JSON.parse(message)
                if(message.type === "guess_value"){
                    guess_values[client.player_id] = message.value
                    if(Object.keys(guess_values).length >= 2){
                        end_game(guess_values,actual_value)
                    }
                }
            })
        }
    })
}
function verify_player(player_credentials){
    if(player_credentials.username === player1_username &&
        player_credentials.password === player1_password){
            return 1;
    }
    else if(player_credentials.username === player2_username &&
        player_credentials.password === player2_password){
            return 2;
    }
    else{
        return null;
    }
}
function init_player(player_socket, player_id){
    players_connected++;
    player_socket.player_id = player_id
    if(players_connected >= 2){
        start_game()
    }
}

wss.on('connection', function connection(socket, req) {
  var ip = req.connection.remoteAddress;
  socket.on('message', function(message){
      console.log(message)
      var data = JSON.parse(message)
      if(data.type === "player_credentials"){
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
