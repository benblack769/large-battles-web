const WebSocket = require('ws');

console.assert(process.argv.length >= 5, "needs 3 command line arguments, port, ip1, ip2")

var port_num = process.argv[2]
var player1_ip = process.argv[3]
var player2_ip = process.argv[4]

var players_connected = 0;
var game_started = false;

const wss = new WebSocket.Server({
    port: port_num,
    //perMessageDeflate: false,
    verifyClient: function(info) {
        var ip = info.req.connection.remoteAddress
        if (ip === player1_ip ||
            ip === player2_ip)
            return true;
        else{
            console.log("bad incoming ip verified: "+ip)
            return false;
        }
    }
})
function get_player_id(ip){
    if(ip === player1_ip){
        return 1
    }
    else if(ip === player2_ip){
        return 2
    }
    else{
        throw "bad string"
    }
}
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
        var player_id = get_player_id(client._socket.remoteAddress)
        client.send(JSON.stringify({
            type: "game_ended",
            result: end_message(result, player_id),
        }))
    })
}
function start_game(){
    var actual_value = randint(100)
    console.log("actual value is: "+actual_value)
    var guess_values = {}
    wss.clients.forEach(function(client){
        client.send(JSON.stringify({
            "type": "game_started"
        }))
        var player_id = get_player_id(client._socket.remoteAddress)
        client.on('message',function(message){
            message = JSON.parse(message)
            if(message.type === "guess_value"){
                guess_values[player_id] = message.value
                if(Object.keys(guess_values).length >= 2){
                    end_game(guess_values,actual_value)
                }
            }
        })
    })
}

wss.on('connection', function connection(socket, req) {
  var ip = req.connection.remoteAddress;
  if(ip === player1_ip){
      console.log("player 1 connected")
      players_connected++;
  }
  else if(ip === player2_ip){
      console.log("player 2 connected")
      players_connected++;
  }
  else{
      socket.close()
      console.log("bad incoming ip late catch: "+ip)
      return
  }
  if(players_connected == 2 && !game_started){
      start_game()
      game_started = true
  }
});
