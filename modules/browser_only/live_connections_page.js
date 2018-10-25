var url_info = require("./url_info.js")
var login_info = require("./signup_login.js")

var socket = null;

function make_text(text){
    var el = document.createElement("span")
    el.innerText = text
    return el
}
function add_cell(row, cell_data){
    var cell = document.createElement("th")
    cell.appendChild(cell_data)
    row.appendChild(cell)
}
function make_request_button(username){
    var button = document.createElement("button")
    button.onclick = function(){
        request_connection(username)
    }
    button.innerText = "Request connection"
    return button
}
function add_row(username){
    var row = document.createElement("tr")
    add_cell(row,make_text(username))
    add_cell(row,make_request_button(username))
    return row
}
function make_table(user_list){
    console.log(user_list)
    var table = document.getElementById("live_games_table_body")
    table.innerHTML = ""
    user_list.forEach(function(user){
        table.appendChild(add_row(user))
    })
}
function request_connection(username){

}
function process_message(msg){
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
