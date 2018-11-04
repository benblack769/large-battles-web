
var myexec_fn = function(clicks){
    console.log("ran default exec, should not happen...")
    console.log(clicks)
}
function replace_exec_fn(js_str){
    console.log("replaced function with: "+js_str )
    myexec_fn = new Function(js_str)
}

onmessage = function(message){
    var message = message.data
    switch(message.type){
        case "REPLACE_FUNCTION": replace_exec_fn(message.js_str); break;
        case "ACTIVATE_FUNCTION": myexec_fn(message.args); break;
    }
}
