var url_info = require("./url_info.js")
var login_info = require("./signup_login.js")
var multiplayer = require("./multiplayer.js")
var single_player = require("./single_player.js")
var game_page = require("./game_page.js")

var socket = null;

function add_cell(row, cell_data){
    var cell = document.createElement("th")
    cell.innerText = (cell_data)
    row.appendChild(cell)
}
function add_row(username, button){
    var row = document.createElement("tr")
    row.id = "__waiting_user"+username
    add_cell(row,username)
    return row
}
function add_button(row,button){
    var res = document.createElement("th")
    res.appendChild(button)
    row.appendChild(res)
}
function request_button(){
    var button = document.createElement("button")
    button.innerText = "Request Game"
    button.onclick = function(){
        var username = this.parentNode.parentNode.id.slice("__waiting_user".length)
        console.log("connected username: "+ username)
        request_connection(username)
    }
    return button
}
function accept_button(){
    var button = document.createElement("button")
    button.innerText = "Accept Game"
    button.onclick = function(){
        var username = this.parentNode.parentNode.id.slice("__waiting_user".length)
        accept_connection(username)
    }
    return button
}
function add_username_to_request_table(username){
    //console.log("added name: " + username)
    var table = document.getElementById("waiting_games_table_body")
    var row = add_row(username)
    table.appendChild(row)
    if(login_info.is_logged_in()){
        add_button(row,request_button())
        var myusername = login_info.get_credentials().username
        if(username === myusername){
            $("#__waiting_user"+myusername + " button").prop('disabled',true)
        }
    }
}
function add_username_to_accept_table(username){
    //console.log("added name: " + username)
    var table = document.getElementById("requested_games_table_body")
    var row = add_row(username)
    table.appendChild(row)
    if(login_info.is_logged_in()) {
        var myusername = login_info.get_credentials().username
        add_button(row,accept_button())
        console.assert(username !== myusername)
    }
}
function remove_username_from_table(username){
    //console.log("removed name: " + username)
    $("#__waiting_user"+username).remove()
}
function request_connection(username){
    console.log(username + " requested")
    socket.send(JSON.stringify({
        type: "request_connection",
        connect_username: username,
    }))
    $("#request_issued_live_games").show()
    $("#request_username_request").text(username)
}
function accept_connection(username){
    console.log("accepted connection: "+username)
    socket.send(JSON.stringify({
        type: "accept_request",
        accepted_username: username,
    }))
    request_accepted(username)
}
function request_accepted(username){
    $("#request_issued_live_games").hide()
    $("#waiting_for_game_live_games").show()
    $("#game_starting_username").text(username)
    $("#requested_games_table_body").empty()
    console.log("request accepted graphic")
}
function add_all_waiting(waiting_list){
    waiting_list.forEach(add_username_to_request_table)
}
function game_started(game_info){
    console.log(game_info)
    var url = "ws://localhost:"+game_info.port
    multiplayer.setup_multiplayer_connection(url)
}
function remove_username_from_all(username){
    remove_username_from_table(username)
    if((document.getElementById("request_issued_live_games").style.display !== 'none' &&
            $("#request_username_request").text() === username) ||
        (document.getElementById("waiting_for_game_live_games").style.display !== 'none' &&
            $("#game_starting_username").text() === username)){
        reset_page()
    }
}
function error_message_popup(err_msg){
    $("#error_message_live_games").show()
    $("#error_message_lg").text(err_msg)
}
function process_message(msg){
    //console.log("received message of type: " + msg.type)
    //console.log(msg)
    switch(msg.type){
        case "waiting_clients": add_all_waiting(msg.client_list); break;
        case "add_waiting_username": add_username_to_request_table(msg.username); break;
        case "remove_waiting_username": remove_username_from_table(msg.username); break;
        case "request_made": add_username_to_accept_table(msg.username); break;
        case "username_disconnected": remove_username_from_all(msg.username); break;
        //case "requester_gone": reset_page();  break;
        case "accepted_request": request_accepted(msg.username); break;
        case "game_started": game_started(msg); break;
        case "acceptance_successful": request_accepted(msg.username); break;
        case "request_successful": break;
        case "waiting_successful": break;
        case "error": error_message_popup(msg.message); break;
    }
}
function reset_page(){
    switch_away_from_live_games();
    switch_to_live_games();
}
function switch_to_live_games(){
    $(".page_level").hide()
    $("#live_games").show()

    $("#requested_games_table_body").empty()
    $("#waiting_games_table_body").empty()

    $("#main_live_game_page").show()
    $("#request_issued_live_games").hide()
    $("#waiting_for_game_live_games").hide()
    $("#error_message_live_games").hide()

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
function init_live_games(){
    $(".central_cancel_button").click(reset_page)
    $("#self_play_game_button").click(function(){
        single_player.create_single_player()
    })
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
    init_live_games: init_live_games,
    switch_to_live_games: switch_to_live_games,
    switch_away_from_live_games: switch_away_from_live_games,
}
