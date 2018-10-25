var url_info = require("./url_info.js")
var login_info = require("./signup_login.js")

var socket = null;

function add_cell(row, cell_data){
    var cell = document.createElement("th")
    cell.innerText = (cell_data)
    row.appendChild(cell)
}
function add_row(username){
    var row = document.createElement("tr")
    row.id = "__user"+username
    add_cell(row,username)
    return row
}
function add_request_buttons(){
    $("#request_button").show()
    var request_button = document.createElement("th")
    var button = document.createElement("button")
    button.innerText = "Request Game"
    button.onclick = function(){
        var username = this.parentNode.parentNode.id.slice(6)
        console.log("connected username: "+ username)
        request_connection(username)
    }
    request_button.appendChild(button)
    $("#live_games_table_body tr").append(request_button)
}
function make_table(user_list){
    console.log(user_list)
    var table = document.getElementById("live_games_table_body")
    table.innerHTML = ""
    $("#request_button").hide()
    var myusername = login_info.get_credentials().username
    user_list.forEach(function(user){
        if(user !== myusername){
            table.appendChild(add_row(user))
        }
    })
    if(login_info.is_logged_in()){
        add_request_buttons()
    }
}
function request_connection(username){
    console.log(username + " requested")
    socket.send(JSON.stringify({
        type: "request_connection",
        connect_username: username,
    }))
}
function process_message(msg){
    console.log("received message of type: " + msg.type)
    console.log(msg)
    switch(msg.type){
        case "waiting_clients": make_table(msg.client_list); break;
        case "game_started": break;
        case "acceptance_successful": break;
        case "accepted_request": break;
        case "request_successful": break;
        case "waiting_successful": break;
        case "error": break;
    }
}
function switch_to_live_games(){
    $(".page_level").hide()
    $("#live_games").show()

    on_init_socket(function(){
        if(login_info.is_logged_in()){
            var creds = login_info.get_credentials()
            socket.send(JSON.stringify({
                type: "add_to_waiting",
                username: creds.username,
                password: creds.password,
            }))
        }
        socket.onmessage = function(message){
            console.log(message.data)
            var parsed_message = JSON.parse(message.data)
            process_message(parsed_message)
        }
    })
}
function switch_away_from_live_games(){
    if(socket){
        socket.close()
        socket = null;
    }
}

function on_init_socket(socket_opened_callback){
    var port = url_info.connect_server_port
    var server = url_info.connect_server_url
    //var server = "localhost"
    var conect_string = 'ws://'+server+':'+port

    socket = new window.WebSocket(conect_string)

    socket.onclose = function(e) {
        console.log('Disconnected!');
    };
    socket.onopen = socket_opened_callback
}
module.exports = {
    switch_to_live_games: switch_to_live_games,
    switch_away_from_live_games: switch_away_from_live_games,
}
