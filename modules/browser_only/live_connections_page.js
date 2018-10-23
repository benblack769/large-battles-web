var url_info = require("./url_info.js")

var socket = null;

function add_cell(row, cell_data){
    var cell = document.createElement("th")
    cell.innerText = cell_data
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
    add_cell(row,username)
    add_cell(row,make_request_button(username))
    return row
}
function make_table(user_list){
    var table = document.getElementById("live_games_table_body")
    table.innerHTML = ""
    user_list.forEach(function(user){
        add_row(user)
    })
}
function request_connection(username){

}
function process_message(msg){
    switch(msg){
        case ""
    }
}
function switch_to_live_games(){
    on_init_socket(function(){
        socket.onmessage = function(message){
            var parsed_message = JSON.parse(message)
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
