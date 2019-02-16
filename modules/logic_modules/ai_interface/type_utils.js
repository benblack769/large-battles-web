var clib = require("../coord_lib.js")
var calc_stat = require("../types.js").calc_stat

function major_coord(instr){
    switch(instr.type){
        case "MOVE": return instr.start_coord;
        case "ATTACK": return instr.source_coord;
        case "BUILD": return instr.coord;
        case "BUY_UNIT": return instr.building_coord;
        case "END_TURN": return null;
        case "BUY_ATTACHMENT": return instr.building_coord;
        case "GAME_STARTED": return null;
    }
}

function minor_coord(instr){
    switch(instr.type){
        case "MOVE": return instr.end_coord;
        case "ATTACK": return instr.target_coord;
        case "BUILD": return null;//instr.coord;
        case "BUY_UNIT": return instr.placement_coord;
        case "END_TURN": return null;
        case "BUY_ATTACHMENT": return instr.equip_coord;
        case "GAME_STARTED": return null;
    }
}
function all_build_types(stats,money){
    return Object.entries(stats.unit_types)
        .filter(a=>a[1].buildable && a[1].cost <= money)
        .map(a=>a[0])
}
function all_moves_units_from(game_state,major_coord,instr_list){

    if(unit_info.status.moved || !calc_stat(game_state.stats,unit_info,"move_range")){
        return;
    }
    var move_range = clib.get_move_range(game_state,major_coord)
    var move_dests = clib.get_possible_moves(game_state.map,major_coord,move_range)
    move_dests.forEach(function(dest){
        instr_list.push({
            type: "MOVE",
            start_coord: major_coord,
            end_coord: dest,
        })
    })
}
function all_attacks_from(game_state,major_coord,instr_list){
    var unit_info = clib.at(game_state.map,major_coord)

    if(unit_info.status.attacked || !calc_stat(game_state.stats,unit_info,"attack_range")){
        return;
    }
    var attack_range = clib.get_attack_range(game_state,major_coord)
    var instrs = clib.coords_around(game_state,major_coord,attack_range)
        .filter(coord=>clib.is_possible_attack(game_state.map,major_coord,coord,attack_range))
        .map(coord=>({
            type: "ATTACK",
            source_coord: major_coord,
            target_coord: coord,
        }))
    instr_list.push(...instrs)
}
function all_buys_from(game_state,major_coord,instr_list){
    var unit_info = clib.at(game_state.map,major_coord)

    var can_make_list = calc_stat(game_state.stats,unit_info,"can_make")
    if(!unit_info.status.buys_left || !can_make_list){
        return
    }
    var buy_type = can_make_list[0]
    var instrs = clib.coords_around(game_state,major_coord,1).map(coord=>({
        type: "BUY_UNIT",
        building_coord: major_coord,
        placement_coord: coord,
        buy_type: buy_type,
    }))
    instr_list.push(...instrs)
}
function all_equips_from(game_state,major_coord,instr_list){
    var unit_info = clib.at(game_state.map,major_coord)

    var can_make_list = calc_stat(game_state.stats,unit_info,"can_make_equip")
    if(!unit_info.status.buys_left || !can_make_list){
        return
    }
    var equips = can_make_list[0]
    var instrs = clib.coords_around(game_state,major_coord,1).map(coord=>({
        type: "BUY_ATTACHMENT",
        building_coord: major_coord,
        equip_coord: coord,
        equip_type: equips,
    }))
    instr_list.push(...instrs)
}
function all_moves_from(game_state,major_coord,myplayer){
    var money_amt = game_state.players.player_info[myplayer].money
    if(!clib.is_valid(game_state,major_coord)){
        return [];
    }
    else if (clib.is_mine(game_state,major_coord,myplayer)) {
        var res = []
        all_moves_units_from(game_state,major_coord,res)
        all_attacks_from(game_state,major_coord,res)
        all_buys_from(game_state,major_coord,res)
        all_equips_from(game_state,major_coord,res)
        return res
    }
    else if(clib.is_empty(game_state.map,major_coord)){
        var tc = clib.find_tc(game_state,major_coord)
        console.log(tc,major_coord)
        if(tc){
            return all_build_types(game_state.stats,money_amt).map(type=>({
                type: "BUILD",
                building_type: type,
                builder_coord: tc,
                coord: major_coord,
            }))
        }
        else{
            return []
        }
    }
    else{
        return []
    }
}
module.exports = {
    major_coord: major_coord,
    minor_coord: minor_coord,
    all_moves_from: all_moves_from,
}
