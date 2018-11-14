
var myexec_fn = function(clicks){
    console.log("ran default exec, should not happen...")
    console.log(clicks)
}
function replace_exec_fn(js_str){
    console.log("replaced function with: "+js_str )
    myexec_fn = function(clicks){eval(js_str)}
}
function make_building(clicks,type){
    console.log("made building at: "+clicks[0])
    postMessage({
        type: "BUILD",
        building_type: type,
        coord: clicks[0],
    })
}
function make_farm(clicks){
    make_building(clicks,"farm")
}
function make_armory(clicks){
    make_building(clicks,"farm")
}
function make_armory(clicks){
    make_building(clicks,"armory")
}
function move_barracks(clicks){
    make_building(clicks,"barracks")
}
function buy_armor(clicks){
    console.log("bought armor at: "+JSON.stringify(clicks[1]))
    postMessage({
        type: "BUY_ATTACHMENT",
        building_coord: clicks[0],
        equip_coord: clicks[1],
        equip_type: "armor",
    })
}
function buy_soldier(clicks){
    console.log("made soldier at: "+JSON.stringify(clicks[1]))
    postMessage({
        type: "BUY_UNIT",
        building_coord: clicks[0],
        placement_coord: clicks[1],
        buy_type: "soldier",
    })
}

function move_soldier(clicks){
    console.log("made soldier at: "+JSON.stringify(clicks[1]))
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
