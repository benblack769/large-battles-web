var create_utils = require('./create_utils.js')

function at(map, coord){
    var res = map[coord.y][coord.x]
    return res
}
function decomp_move(gamestate,instr,player){
    return [{
        type: "MOVE",
        start_coord: instr.start_coord,
        end_coord: instr.end_coord,
    },
    {
        type: "SET_STATUS",
        status_key: "moved",
        new_status: true,
        coord: instr.end_coord,
    }]
}
function decomp_build(gamestate,instr,player){
    return [{
        type: "CREATE",
        coord: instr.coord,
        data: create_utils.create_unit(instr.building_type,player),
    },{
        type: "SET_MONEY",
        player: player,
        amount: gamestate.players.player_info[player].money - gamestate.stats.unit_types[instr.building_type].cost,
    }]
}
function next_player(player_state, active_player){
    var idx = player_state.players_order.indexOf(active_player)
    var newidx = (idx + 1) % player_state.players_order.length
    var new_id = player_state.players_order[newidx]
    return new_id
}
function get_current_income(gamestate,instr,player){
    var income = 0;
    gamestate.map.forEach(function(row){
        row.forEach(function(entry){
            if(entry.category === "unit" && entry.player === player){
                var unit_stats = gamestate.stats.unit_types[entry.unit_type]
                if(unit_stats.income){
                    income += unit_stats.income
                }
            }
        })
    })
    return income
}
function reset_entry(entry_stack,entry,coord,key,new_value){
    if(entry.status[key] !== undefined && entry.status[key] !== new_value){
        entry_stack.push({
            type: "SET_STATUS",
            status_key: key,
            new_status: new_value,
            coord: coord,
        })
    }
}
function all_status_resets(gamestate,instr,player){
    var map = gamestate.map
    var all_resets = []
    for(var y = 0; y < map.length; y++){
        for(var x = 0; x < map[y].length; x++){
            var coord = {x:x,y:y}
            var entry = at(map, coord)
            if(entry.category === "unit"){
                reset_entry(all_resets,entry,coord,"moved",false)
                var buys_per_turn = gamestate.stats.unit_types[entry.unit_type].buys_per_turn
                if(buys_per_turn){
                    reset_entry(all_resets,entry,coord,"buys_left",buys_per_turn)
                }
            }
        }
    }
    return all_resets
}
function decomp_endturn(gamestate,instr,player){
    var status_resets = all_status_resets(gamestate,instr,player)
    var money_entry = {
        type: "SET_MONEY",
        player: player,
        amount: gamestate.players.player_info[player].money + get_current_income(gamestate,instr,player),
    }
    var active_entry = {
        type: "SET_ACTIVE_PLAYER",
        player: next_player(gamestate.players,player),
    }
    var total_list = status_resets.concat([money_entry,active_entry])
    return total_list
}
function decomp_buy_unit(gamestate,instr,player){
    return [{
        type: "CREATE",
        coord: instr.placement_coord,
        data: create_utils.create_unit(instr.buy_type,player),
    }, {
        type: "SET_MONEY",
        player: player,
        amount: gamestate.players.player_info[player].money - gamestate.stats.unit_types[instr.buy_type].cost,
    }, {
        type: "SET_STATUS",
        status_key: "buys_left",
        new_status: at(gamestate.map,instr.building_coord).status.buys_left - 1,
        coord: instr.building_coord,
    },]
}
function decomp_buy_attachment(gamestate,instr,player){
    return [{
           type: "SET_MONEY",
           player: player,
           amount: gamestate.players.player_info[player].money - gamestate.stats.attachment_types[instr.equip_type].cost,
       }, {
           type: "SET_STATUS",
           status_key: "buys_left",
           new_status: at(gamestate.map,instr.building_coord).status.buys_left - 1,
           coord: instr.building_coord,
       }, {
           type: "ADD_EQUIPMENT",
           equip_type: instr.equip_type,
           coord: instr.equip_coord,
       },]
}
var decomp_funcs = {
    "MOVE": decomp_move,
    "BUILD": decomp_build,
    "BUY_UNIT": decomp_buy_unit,
    "END_TURN": decomp_endturn,
    "BUY_ATTACHMENT": decomp_buy_attachment,
}
function decompose_instructions(gamestate,instr,player){
    return decomp_funcs[instr.type](gamestate,instr,player)
}
module.exports = {
    decompose_instructions: decompose_instructions,
}
