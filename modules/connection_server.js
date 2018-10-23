var WebSocketServer = require('ws').Server;
var request = require('request');
var child_process = require('child_process');

var listen_port = 9003;
var wss = new WebSocketServer({ port: listen_port });
console.log("listening on port: "+listen_port)

var waiting_clients = {}

function verify_username_password(username,password,on_verify){
    var req_options = {
        uri: 'http://localhost:8000/verify_user',
        method: 'POST',
        json: {
            "username": username,
            "password": password,
        }
    };

    request(req_options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var verify_result = JSON.parse(body)
            if(verify_result.type === "login_success"){
                on_verify(true)
            }
            else{
                on_verify(false)
            }
            console.log(body.id) // Print the shortened url.
        }
    });
}
function send_error(socket,errname){
    socket.send(JSON.stringify({
        "type": "error",
        "message": "BAD_USERNAME_PASSWORD_COMBINATION"
    }))
}
function get_unused_port(){
    return 9005
}
function get_unique_game_id(){
    return 12123
}
function start_game(socket1,socket2){
    var game_port = get_unused_port()
    var args = [
        "server_main.js",
        game_port,
        get_unique_game_id(),
        socket1.__username,
        socket2.__username,
        socket1.__password,
        socket2.__password,
    ]
    child_process.spawn("node",args,{
        detached: true,
        stdio: 'ignore',
    })
    socket1.send(JSON.stringify({
        "type":"game_started",
        "port": game_port,
    }))
    socket2.send(JSON.stringify({
        "type":"game_started",
        "port": game_port,
    }))
}
function handle_bad_verification(socket,verified,on_verify){
    if(!verified){
        send_error(socket,"BAD_USERNAME_PASSWORD_COMBINATION")
    }
    on_verify()
}
function message_handling(socket,message){
    var msg = JSON.parse(message);
    if(msg.type === "add_to_waiting"){
        verify_username_password(msg.username,msg.password,function(verified){
            handle_bad_verification(socket,verified,function(){
                socket.send(JSON.stringify({
                    "type": "waiting_successful"
                }))
                waiting_clients[msg.username] = socket
                socket.__username = msg.username
                socket.__password = msg.password
            })
        })
    }
    else if(msg.type === "request_connection"){
        if(!socket.__username){
            send_error(socket, "NOT_IN_WAITING_LIST")
        }
        else if(!waiting_clients[msg.connect_username]){
            send_error(socket, "REQUESTED_USER_NOT_WAITING")
        }
        else{
            socket.send(JSON.stringify({
                "type": "request_successful"
            }))
            waiting_clients[msg.connect_username].send(JSON.stringify({
                "type": "request_made",
                "username": socket.__username,
            }))
            socket.__requested_username = msg.connect_username
        }
    }
    else if(msg.type === "accept_request") {
        if(!socket.__username){
            send_error(socket, "SELF_NOT_IN_WAITING_LIST")
        }
        else if(!waiting_clients[msg.accepted_username]){
            send_error(socket, "ACCPETED_USERNAME_NOT_IN_WAITING_LIST")
        }
        else if(!waiting_clients[msg.accepted_username].__requested_username ||
                 !(waiting_clients[msg.accepted_username].__requested_username  === socket.__username)){
            send_error(socket, "ACCPETED_DID_NOT_REQUEST_YOU")
        }
        else{
            socket.send(JSON.stringify({
                "type": "acceptance_successful"
            }))
            waiting_clients[msg.accepted_username].send(JSON.stringify({
                "type": "accepted_request",
                "username": socket.__username,
            }),
            function (error) {
              // If error is not defined, the send has been completed, otherwise the error
              // object will indicate what failed.
              if(error){
                  send_error(socket, "COULD_NOT_REACH_REQUESTER")
              }
              else{
                  start_game(socket,waiting_clients[msg.accepted_username])
              }
            })
        }
    }
    else{
        console.log("bad messgage type")
    }
}
wss.on('connection', function connection(ws) {
    ws.send(JSON.stringify({
        "type":"waiting_clients",
        "client_list": Object.keys(waiting_clients),
    }))
    message_handling(ws)
    ws.on('message', function incoming(message) {
      message_handling(socket, message)
    });
    ws.on('close', function close() {
      if(waiting_clients[ws.__username]){
          delete waiting_clients[ws.__username];
      }
    })
})
