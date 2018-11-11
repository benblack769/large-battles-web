var create_utils = require('./create_utils.js')

function set(map, coord, value){
    map[coord.y][coord.x] = value
}
function at(map, coord){
    var res = map[coord.y][coord.x]
    return res ? res : {}
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
function decomp_endturn(gamestate,instr,player){
    var current_money = gamestate.players.player_info[player].money;
    gamestate.map.forEach(function(row){
        row.forEach(function(entry){
            if(entry.category === "unit" && entry.player === player){
                var unit_stats = gamestate.stats.unit_types[entry.unit_type]
                if(unit_stats.income){
                    current_money += unit_stats.income
                }
            }
        })
    })
    return [{
        type: "SET_MONEY",
        player: player,
        amount: current_money,
    },{
        type: "SET_ACTIVE_PLAYER",
        player: next_player(gamestate.players,player),
    }]
}
var decomp_funcs = {
    "MOVE": decomp_move,
    "BUILD": decomp_build,
    "END_TURN": decomp_endturn,
}
function decompose_instructions(gamestate,instr,player){
    return decomp_funcs[instr.type](gamestate,instr,player)
}
module.exports = {
    decompose_instructions: decompose_instructions,
}
