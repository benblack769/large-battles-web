function set(map, coord, value){
    map[coord.y][coord.x] = value
}
function at(map, coord){
    var res = map[coord.y][coord.x]
    return res ? res : {}
}
function exec_move(gamestate,instr){
    var sc = instr.start_coord
    var ec = instr.end_coord
    var obj = gamestate[sc.y][sc.x]
    gamestate[ec.y][ec.x] = obj
}
var exec_funcs = {
    "MOVE": exec_move,
}
function execute_instruction(gamestate,instr){
    funcs[instr.type](gamestate,instr)
}
module.exports = {
    execute_instruction: execute_instruction,
}
