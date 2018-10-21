
//my ip = ::ffff:192.168.0.23

var PORT = 12222
var server = "ec2-35-165-130-155.us-west-2.compute.amazonaws.com"//"192.168.0.23"
//var server = "localhost"
var conect_string = 'ws://'+server+':'+PORT

var socket = new window.WebSocket(conect_string)

var username = "user2"
var password = "pass2"


socket.onopen = function(){
    socket.send(JSON.stringify({
        type: "player_credentials",
        username: username,
        password: password,
    }))
}
socket.onmessage = function(message){
    console.log(message.data)
    message = JSON.parse(message.data)
    if(message.type === "game_started"){
        var input_bar = document.getElementById("guess_value")
        input_bar.style.display = "block"
        input_bar.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                socket.send(JSON.stringify({
                    "type":"guess_value",
                    "value":input_bar.innerText
                }))
                console.log("sent guess!")
            }
        })
    }
    else if(message.type === "game_ended"){
        document.getElementById("result_value").innerText = message.result
    }
}
