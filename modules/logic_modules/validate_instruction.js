var pathing = require("./pathing.js")

function at(map, coord){
    return map[coord.y][coord.x]
}
function assert_empty(map, coord) {
    if(at(map,coord).category !== "empty"){
        throw new Error('Coordinate should be empty, was not')
    }
}
function deep_equals(obj1,obj2){
    return JSON.stringify(obj1) === JSON.stringify(obj2)
}
function assert_keys_equal(instr, keys){
    var inst_keys = Object.keys(instr).sort()
    if(!deep_equals(keys.sort(),inst_keys)){
        throw new Error('Instruction contained bad keys:'+JSON.stringify(inst_keys))
    }
}
function assert_player_is(map, coord, player){
    if(at(map, coord).player !== player){
        throw new Error('Targeted player other than self')
    }
}
function assert_actual_move(sc,ec){
    if(deep_equals(sc,ec)){
        throw new Error('zero position moves invalid')
    }
}
function assert_is_unit(map, coord){
    if(at(map,coord).category !== "unit"){
        throw new Error('Coordinate should be unit, was '+at(map,coord).category)
    }
}
function assert_is_valid_coord(coord, map){
    assert_keys_equal(coord,["x","y"])
    if(at(map,coord) === undefined){
        throw new Error('bad coordinate')
    }
}
function assert_hasnt_moved(unit){
    if(unit.status.moved){
        throw new Error('tried to move unit twice in single turn')
    }
}
function assert_movement_range(gamestate, instr, unit){
    var range = gamestate.stats.unit_types[unit.unit_type].move_range
    var is_possible = pathing.is_possible_move(gamestate.map, instr.start_coord, instr.end_coord, range)
    if(!is_possible){
        throw new Error('Square out of movement range. Remember that units cannot move through each other')
    }
}
function valid_move(gamestate, instr, player){
    assert_keys_equal(instr,["type","start_coord","end_coord"])
    assert_is_valid_coord(instr.start_coord,gamestate.map)
    assert_is_valid_coord(instr.end_coord,gamestate.map)
    assert_empty(gamestate.map, instr.end_coord)
    assert_is_unit(gamestate.map, instr.start_coord)
    assert_player_is(gamestate.map, instr.start_coord, player)
    assert_actual_move(instr.start_coord,instr.end_coord)
    var unit = at(gamestate.map, instr.start_coord)
    assert_hasnt_moved(unit)
    assert_movement_range(gamestate, instr, unit)
}
var validate_funcs = {
    "MOVE": valid_move,
}
function validate_instruction(gamestate, instr, player){
    try{
        if(instr.type && validate_funcs[instr.type]) {
            validate_funcs[instr.type](gamestate, instr, player)
        }
        else{
            throw new Error('Bad type')
        }
        return null;
    }
    catch(e) {
        //console.log("ERROR "+e.name+": \n"+e.message)
        return e;
    }
}
module.exports = {
    validate_instruction: validate_instruction,
}
