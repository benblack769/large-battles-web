function consume_move(game_state, instr){
    console.log("consumed moved!")
    var sc = instr.start_coord
    var ec = instr.end_coord
    var obj = gamestate.map[sc.y][sc.x]
    gamestate.map[ec.y][ec.x] = obj
}
function consume_create(game_state, instr){
    game_state.map[instr.coord] = instr.data
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
