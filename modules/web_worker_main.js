
var myexec_fn = function(clicks){
    console.log("ran default exec, should not happen...")
    console.log(clicks)
}
function replace_exec_fn(js_str){
    console.log("replaced function with: "+js_str )
    myexec_fn = function(clicks){eval(js_str)}
}
function make_farm(clicks){
    console.log("made farm at: "+clicks[0])
    postMessage({
        type: "BUILD",
        building_type: "farm",
        coord: clicks[0],
    })
}
function make_soldier(clicks){
    console.log("made soldier at: "+JSON.stringify(clicks[0]))
    postMessage({
        type: "MOVE",
        start_coord: clicks[0],
        end_coord: clicks[1],
    })
}

onmessage = function(message){
    var message = message.data
    switch(message.type){
        case "REPLACE_FUNCTION": replace_exec_fn(message.js_str); break;
        case "ACTIVATE_FUNCTION": myexec_fn(message.args); break;
    }
}
