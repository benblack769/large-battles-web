var SimplePeer = require("simple-peer")
var $ = require('jquery');

var socket = null

var myusername = null;

var peer_con = null;


var on_interactive_setup_fn = null

function on_init_socket(socket_opened_callback){
    var PORT = 9001
    var server = "ec2-35-165-130-155.us-west-2.compute.amazonaws.com"
    //var server = "localhost"
    var conect_string = 'ws://'+server+':'+PORT

    socket = new window.WebSocket(conect_string)

    socket.onclose = function(e) {
        console.log('Disconnected!');
        $("#entername").show()
        $("#display_users").hide()
    };
    socket.onopen = socket_opened_callback
}

function init_peer_con(initiator, requested_con_name){
    peer_con = new SimplePeer({
        initiator: initiator,
        trickle: false,
        config: {
          iceServers: [
              {
                  urls: "stun:stun.l.google.com:19302"
              },
              {
                  url: 'turn:35.165.130.155:3478',
                  username: 'benblack',
                  credential: 'mky34769'
              }
          ]
        }
    })
    peer_con.on('signal', function(data){
        console.log(data)
        socket.send(JSON.stringify({
            "type": "signal_data",
            "initiator": initiator,
            "data": data,
            "destination": requested_con_name,
        }))
    })
    peer_con.on('connect', function () {
        console.log('CONNECT')
        on_interactive_setup_fn(peer_con)
    })
}

function add_children(parent,child_list){
    child_list.forEach(function(child){
        parent.appendChild(child)
    })
}
function gray_out_requests(succeeded_request){
    var request_buttons = $(".requests_class")
    request_buttons.prop("disabled", true)
    $("#_button_id_"+succeeded_request).hide()
    $("#_stop_button_id_"+succeeded_request).show()
}
function request_clicked(requested_name){
    socket.send(JSON.stringify({
        "type": "request_connection",
        "name": requested_name,
    }))
    console.log("requested name: "+requested_name)
    socket.onmessage = function(event){
        var message = JSON.parse(event.data)

        if (message.type == "request_succeeded"){
            gray_out_requests(message.name)
        }
        else if (message.type == "get_connect_info"){
            console.log("connectinfo triggered")
            init_peer_con(true, requested_name)
        }
        else if (message.type == "offer_info"){
            console.log("offer triggered")
            init_peer_con(false, requested_name)
            peer_con.signal(message.data)
        }
        else if (message.type == "accepted_info"){
            console.log("accepted triggered")
            peer_con.signal(message.data)
        }
        else{
            console.log("bad response from server" + event.data)
        }
    }
}
function reset_requests(){
    $(".stop_request_class").hide()
    $(".requests_class").show()
    $(".requests_class").prop("disabled", false)
}
function stop_request_clicked(){
    socket.send(JSON.stringify({
        "type": "delete_connection_request"
    }))
    socket.onmessage = function(event){
        var message = JSON.parse(event.data)

        if (message.type == "delete_request_succeeded"){
            console.log("removed request for name: " + message.name)
            reset_requests()
        }
        else{
            console.log("bad response from server" + event.data)
        }
    }
}
function add_user_row(username){
    var name_cell =  document.createElement("th")
    name_cell.innerText = username

    var request_button_cell =  document.createElement("th")

    var request_button =  document.createElement("button")
    request_button.innerText = "Request game"
    request_button.id = "_button_id_"+username
    request_button.className = "requests_class"
    request_button.onclick = function(){
        request_clicked(username)
    }

    var stop_request_button =  document.createElement("button")
    stop_request_button.innerText = "Cancel request"
    stop_request_button.onclick = stop_request_clicked
    stop_request_button.style.display = "none"
    stop_request_button.className = "stop_request_class"
    stop_request_button.id = "_stop_button_id_"+username

    request_button_cell.appendChild(request_button)
    request_button_cell.appendChild(stop_request_button)

    var user_row = document.createElement("tr")
    user_row.className = "username_row"
    user_row.appendChild(name_cell)
    user_row.appendChild(request_button_cell)

    document.getElementById("other_users")
            .appendChild(user_row)
}
function display_users_list(user_list){
    $("#entername").hide()
    $("#display_users").show()
    $(".username_row").remove()
    user_list.forEach(function(user){
        if(user != myusername){
            add_user_row(user)
        }
    })
}
function on_get_users_list(func){
    socket.send(JSON.stringify({
        "type": "get_client_info",
    }))
    socket.onmessage = function(event){
        var message = JSON.parse(event.data)
        if (message.type == "clientlist"){
            var client_list = message.info
            func(client_list)
        }
        else{
            console.log("bad response from server" + event.data)
        }
    }
}
function try_username(name, call_on_success){
    $("#err_too_long").hide()
    $("#err_already_taken").hide()
    socket.send(JSON.stringify({
        "type": "postid",
        "info": name,
    }))
    socket.onmessage = function(event){
        var message = JSON.parse(event.data)
        if (message.type == "error"){
            if(message.errname == "NAME_TOO_LONG"){
                $("#err_too_long").show()
            }
            else if(message.errname == "CLIENT_ID_USED"){
                $("#err_already_taken").show()
            }
            else{
                console.log("bad error type")
            }
        }
        else if (message.type == "postid_success"){
            call_on_success()
        }
        else{
            console.log("bad username response from server" + event.data)
        }
    }
}
function refresh_users(){
    on_get_users_list(display_users_list)
}
function setup_interactive(on_interactive_setup){
    on_interactive_setup_fn = on_interactive_setup
    $("#submit").click(function(){
        var username_attmpt = $("#username_input").val()
        try_username(username_attmpt,function(){
            myusername = username_attmpt
            $("#myusername").text(username_attmpt)
            refresh_users()
        })
    })
    $("#refresh_users").click(refresh_users)
}


module.exports.setup_interactive = setup_interactive
module.exports.on_init_socket = on_init_socket
