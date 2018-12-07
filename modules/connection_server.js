var WebSocketServer = require('ws').Server;
var request = require('request');
var child_process = require('child_process');
var client_info = require('./server_only/game_request_status.js').ClientInfo;
var fs = require('fs')
var crypto = require('crypto')

var listen_port = 9003;
var wss = new WebSocketServer({ port: listen_port });
console.log("listening on port: "+listen_port)



function add_waiting(client_id){
    wss.clients.forEach(function(client){
        client.send(JSON.stringify({
            "type": "add_waiting_username",
            "username": client_id,
        }),function(err){if(err){console.log(err)}})
    })
}
function remove_waiting(client_id){
    wss.clients.forEach(function(client){
        client.send(JSON.stringify({
            "type": "remove_waiting_username",
            "username": client_id,
        }),function(err){if(err){console.log(err)}})
    })
}
function add_requester(target_client_info, client_id){
    console.log("added requester to socket: "+target_client_info.__username)
    target_client_info.socket.send(JSON.stringify({
        "type": "request_made",
        "username": client_id,
    }))
}
function disconnected(client_id){
    wss.clients.forEach(function(client){
        client.send(JSON.stringify({
            "type": "username_disconnected",
            "username": client_id,
        }),function(err){if(err){console.log(err)}})
    })
}
function client_state_error(client_id, errmsg){
    if(waiting_clients.is_authenticated(client_id)){
        var socket = waiting_clients.get_client_info(client_id).socket
        send_error(socket,errmsg)
        console.log("authenticated user error:")
    }
    else{
        console.log("unauthenticated user error:")
    }
    console.log("error: "+errmsg+" from ip: "+socket._socket.remoteAddress)
}
var waiting_clients = new client_info(add_waiting, remove_waiting, add_requester, disconnected, client_state_error)

function verify_username_password(username,password,on_verify){
    var req_options = {
        uri: 'http://localhost:8803/verify_user',
        method: 'POST',
        json: {
            "username": username,
            "password": password,
        }
    };
    console.log("requested verification.")

    request(req_options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var verify_result = body
            console.log(body)
            if(verify_result.type === "login_success"){
                console.log("verified!!!")
                on_verify(true)
            }
            else{
                on_verify(false)
            }
        }
    });
}
function send_error(socket,errname){
    socket.send(JSON.stringify({
        "type": "error",
        "message": errname,
    }),function (error) {
        //do nothing, we don't really care if an error didn't get processed correctly
    })
}
function get_unused_port(on_port){
    run_command = 'ruby -e \'require "socket"; puts Addrinfo.tcp("", 0).bind {|s| s.local_address.ip_port }\' '
    child_process.exec(run_command,function(err,stdout,stderr){
        if(err){
            console.log("error producing port")
        }
        on_port(stdout)
    })
}
function get_unique_game_id(on_game_id){
    return crypto.randomBytes(16, function(err, buffer) {
      var token = buffer.toString('hex');
      on_game_id(token)
    });
}
function start_game(cl1,cl2){
    get_unused_port(function(game_port){
        get_unique_game_id(function(unique_game_id){
            var args = [
                "server_main.js",
                game_port,
                unique_game_id,
                cl1.username,
                cl2.username,
                cl1.password,
                cl2.password,
            ]
            var proc = child_process.spawn("node",args,{
                //detached: true,
                //stdio: 'ignore',
            })
            var logStream = fs.createWriteStream('./logFile.log', {flags: 'a'});
            proc.stdout.pipe(logStream);
            proc.stderr.pipe(logStream);

            console.log("started server")
            console.log(args)
            cl1.socket.send(JSON.stringify({
                "type":"game_started",
                "username": cl2.username,
                "port": game_port,
                "game_id": unique_game_id,
            }))
            cl2.socket.send(JSON.stringify({
                "type":"game_started",
                "username": cl1.username,
                "port": game_port,
                "game_id": unique_game_id,
            }))
        })
    })
}
function handle_bad_verification(socket,verified,on_verify){
    if(!verified){
        send_error(socket,"BAD_USERNAME_PASSWORD_COMBINATION")
    }
    else{
        on_verify()
    }
}
function send_full_waiting_list(client){
    client.send(JSON.stringify({
        "type":"waiting_clients",
        "client_list": waiting_clients.get_waiting_list(),
    }))
}
function message_handling(socket,message){
    var msg = JSON.parse(message);
    console.log(msg)
    if(msg.type === "add_to_waiting"){
        verify_username_password(msg.username, msg.password, function(verified){
            handle_bad_verification(socket, verified, function(){
                var client_info = {
                    username: msg.username,
                    password: msg.password,
                    socket: socket,
                }
                if(waiting_clients.authenticated(msg.username, client_info)){
                    socket.send(JSON.stringify({
                        "type": "waiting_successful"
                    }),function(){})
                    socket.__username = msg.username
                }
            })
        })
    }
    else if(msg.type === "request_connection") {
        var myusername = socket.__username
        if(waiting_clients.requesting(myusername,msg.connect_username)){
            socket.send(JSON.stringify({
                "type": "request_successful"
            }))
        }
    }
    else if(msg.type === "accept_request") {
        var myusername = socket.__username
        if(waiting_clients.accepting(myusername, msg.accepted_username)){
            socket.send(JSON.stringify({
                "type": "acceptance_successful",
                "username": msg.accepted_username,
            }))
            waiting_clients.get_client_info(msg.accepted_username).socket.send(
                JSON.stringify({
                    "type": "accepted_request",
                    "username": myusername,
                }),
                function (error) {
                  // If error is not defined, the send has been completed, otherwise the error
                  // object will indicate what failed.
                  if(error){
                      send_error(socket, "COULD_NOT_REACH_REQUESTER")
                  }
                  else{
                    if(waiting_clients.game_should_start(myusername,msg.accepted_username)){
                        var my_clientinfo = waiting_clients.get_client_info(myusername)
                        var other_clientinfo = waiting_clients.get_client_info(msg.accepted_username)
                        start_game(my_clientinfo,other_clientinfo)
                    }
                    else{
                        send_error(socket, "SOME_STATE_CHANGED_BEFORE_GAME_START")
                    }
                  }
            })
        }
    }
    else{
        console.log("bad messgage type")
    }
}
wss.on('connection', function connection(ws) {
    send_full_waiting_list(ws)
    ws.on('message', function(message) {
        console.log(message)
        message_handling(ws, message)
    });
    ws.on('close', function() {
        waiting_clients.disconnected(ws.__username)
    })
})
