var get_serv_inf = require("./browser_only/get_server_info.js")


var peer_con = null;

function interactive_setup_finished(peer_connection){
    console.log("interactive_setup_finished")
    peer_con = peer_connection
}
window.onload = function(){
    socket.onopen = get_serv_inf.setup_interactive(interactive_setup_finished)
}
