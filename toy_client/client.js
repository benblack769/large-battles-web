
//my ip = ::ffff:192.168.0.23

var PORT = 12222
var server = "192.168.0.23"
//var server = "localhost"
var conect_string = 'ws://'+server+':'+PORT

socket = new window.WebSocket(conect_string)

//socket.onopen = function(){
//}
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
