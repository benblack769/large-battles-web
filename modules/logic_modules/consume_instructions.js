var create_utils = require('./create_utils.js')

function at(map, coord){
    return map[coord.y][coord.x]
}
function set(map, coord, val){
    map[coord.y][coord.x] = val
}
function consume_move(game_state, instr){
    console.log("consumed moved!")
    var sc = instr.start_coord
    var ec = instr.end_coord
    var map = game_state.map
    var obj = at(map,sc)
    set(map,ec,obj)
    set(map,sc,create_utils.create_empty())
}
function consume_create(game_state, instr){
    set(game_state.map,instr.coord,instr.data)
}
var consume_funcs = {
    "MOVE": consume_move,
    "CREATE": consume_create,
}
function consume_change(gamestate, instr){
    consume_funcs[instr.type](gamestate,instr)
}

module.exports = {
    consume_change: consume_change,
}
