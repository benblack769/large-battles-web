function at(map, coord){
    var res = map[coord.y][coord.x]
    return res ? res : {}
}
function assert_empty(map, coord) {
    if(at(map,coord) !== null){
        throw new Error('Coordinate should be empty, was not')
    }
}
function deep_equals(obj1,obj2){
    return JSON.stringify(obj1) === JSON.stringify(obj2)
}
function assert_keys_equal(instr, keys){
    var inst_keys = Object.keys(instr)
    if(!deep_equals(keys,inst_keys)){
        throw new Error('Instruction contained bad keys')
    }
}
function assert_player_is(map, coord, player){
    if(at(map, coord).player !== player){
        throw new Error('Targeted player other than self')
    }
}
function valid_move(gamestate, instr, player){
    assert_keys_equal(instr,["start_coord","end_coord"])
    assert_empty(gamestate.map, instr.end_coord)
    assert_player_is(gamestate.map, instr.end_coord, player)
}
var validate_funcs = {
    "MOVE": valid_move,
}
function validate_instruction(gamestate,instr){
    try{
        if(instr.type && validate_funcs[instr.type]) {
            validate_funcs[instr.type](gamestate,instr)
        }
        else{
            throw new Error('Bad type')
        }
        return null;
    }
    catch(e) {
        console.log("ERROR "+e.name+": \n"+e.message)
        return e;
    }
}
module.exports = {
    validate_instruction: validate_instruction,
}
