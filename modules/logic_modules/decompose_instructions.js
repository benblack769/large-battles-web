
function set(map, coord, value){
    map[coord.y][coord.x] = value
}
function at(map, coord){
    var res = map[coord.y][coord.x]
    return res ? res : {}
}
function decomp_move(gamestate,instr){
    return [{
        type: "MOVE",
        start_coord: instr.start_coord,
        end_coord: instr.end_coord,
    }]
}
var decomp_funcs = {
    "MOVE": decomp_move,
}
function decompose_instructions(gamestate,instr){
    return decomp_funcs[instr.type](gamestate,instr)
}
module.exports = {
    decompose_instructions: decompose_instructions,
}
