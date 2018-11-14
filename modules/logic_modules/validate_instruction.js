var pathing = require("./pathing.js")
var calc_stat = require("./types.js").calc_stat

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
    if(map[coord.y] === undefined || map[coord.y][coord.x] === undefined){
        throw new Error('bad coordinate')
    }
}
function assert_hasnt_moved(unit){
    if(unit.status.moved){
        throw new Error('tried to move unit twice in single turn')
    }
}
function assert_in_range(map,start_coord,end_coord,range){
    var is_possible = pathing.is_possible_move(map, start_coord, end_coord, range)
    if(!is_possible){
        var possible_moves = pathing.get_possible_moves(map, start_coord, range)
        console.log(possible_moves)
        throw new Error('Square out of range. Remember that nothing can move through a unit. Possible moves are: '+JSON.stringify(possible_moves))
    }
}
function assert_movement_range(gamestate, instr, unit){
    var range = calc_stat(gamestate.stats,unit,"move_range")
    assert_in_range(gamestate.map, instr.start_coord, instr.end_coord, range)
}
/*function assert_active_player(gamestate, player){
    if(gamestate.players.active_player !== player){
        throw new Error('You are not the current active player, so you cannot execute instructions')
    }
}*/
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
function get_money(gamestate, player_id){
    return gamestate.players.player_info[player_id].money
}
function assert_money_enough(build_type, player_id, gamestate){
    if(gamestate.stats.unit_types[build_type].cost > get_money(gamestate,player_id)){
        throw new Error('Building costs more money than you have!!')
    }
}
function assert_money_enough_equip(build_type, player_id, gamestate){
    if(gamestate.stats.attachment_types[build_type].cost > get_money(gamestate,player_id)){
        throw new Error('Equipment costs more money than you have!!')
    }
}
function assert_buildable(build_type, game_stats){
    if(!game_stats.unit_types[build_type].buildable){
        throw new Error('Unit type not buildable!')
    }
}
function valid_build(gamestate, instr, player){
    assert_keys_equal(instr,["type","building_type","coord"])
    assert_is_valid_coord(instr.coord,gamestate.map)
    assert_empty(gamestate.map, instr.coord)
    assert_buildable(instr.building_type,gamestate.stats)
    assert_money_enough(instr.building_type, player, gamestate)
}
function valid_end_turn(gamestate, instr, player){
    assert_keys_equal(instr,["type"])
}
function assert_building_can_build(gamestate,instr,player){
    var building = at(gamestate.map,instr.building_coord)
    var building_stats = gamestate.stats.unit_types[building.unit_type]
    var building_status = building.status
    if(!building_stats.can_make || !building_stats.can_make.includes(instr.buy_type)){
        throw new Error('Selected building of type: "'+building.unit_type+'" cannot make unit of type: "'+instr.buy_type+'"')
    }
    if(!building_status.buys_left){
        throw new Error('Building cannot buy any more units this turn. Wait until next turn.')
    }
}
function valid_buy_unit(gamestate, instr, player){
    assert_keys_equal(instr,["type","building_coord","placement_coord","buy_type"])
    assert_is_valid_coord(instr.building_coord,gamestate.map)
    assert_is_valid_coord(instr.placement_coord,gamestate.map)
    assert_empty(gamestate.map, instr.placement_coord)
    assert_is_unit(gamestate.map, instr.building_coord)
    assert_player_is(gamestate.map, instr.building_coord, player)
    assert_money_enough(instr.buy_type, player, gamestate)
    assert_building_can_build(gamestate,instr,player)
    var BUY_RANGE = 1
    assert_in_range(gamestate.map, instr.building_coord, instr.placement_coord, BUY_RANGE)
}
function assert_building_can_equip(gamestate,instr,player){
    var building = at(gamestate.map,instr.building_coord)
    var building_stats = gamestate.stats.unit_types[building.unit_type]
    var building_status = building.status
    if(!building_stats.can_make_equip || !building_stats.can_make_equip.includes(instr.equip_type)){
        throw new Error('Selected building of type: "'+building.unit_type+'" cannot make equipment of type: "'+instr.equip_type+'"')
    }
    if(!building_status.buys_left){
        throw new Error('Building cannot buy any more equipment this turn. Wait until next turn.')
    }
}
function assert_target_can_be_equipped(gamestate, instr){
    var target = at(gamestate.map,instr.equip_coord)
    var target_stats = gamestate.stats.unit_types[target.unit_type]
    if(!target_stats.viable_attachments || !target_stats.viable_attachments.includes(instr.equip_type)){
        throw new Error('Target unit: "'+target.unit_type+'" cannot equip equipment of type: "'+instr.equip_type+'"')
    }
    if(target.attachments.includes(instr.equip_type)){
        throw new Error('Target unit already has equipment of type: "'+instr.equip_type+'"')
    }
}
function valid_buy_attachment(gamestate, instr, player){
    assert_keys_equal(instr,["type","building_coord","equip_coord","equip_type"])
    assert_is_valid_coord(instr.building_coord,gamestate.map)
    assert_is_valid_coord(instr.equip_coord,gamestate.map)
    assert_is_unit(gamestate.map, instr.equip_coord)
    assert_is_unit(gamestate.map, instr.building_coord)
    assert_player_is(gamestate.map, instr.equip_coord, player)
    assert_player_is(gamestate.map, instr.building_coord, player)
    assert_money_enough_equip(instr.equip_type, player, gamestate)
    assert_building_can_equip(gamestate,instr,player)
    assert_target_can_be_equipped(gamestate,instr)
    var EQUIP_RANGE = 1
    assert_in_range(gamestate.map, instr.building_coord, instr.equip_coord, EQUIP_RANGE)
}
var validate_funcs = {
    "MOVE": valid_move,
    "BUILD": valid_build,
    "BUY_UNIT": valid_buy_unit,
    "BUY_ATTACHMENT": valid_buy_attachment,
    "END_TURN": valid_end_turn,
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
