var pathing = require("./pathing.js")
var calc_stat = require("./types.js").calc_stat

function at(map,coord){
    return map[coord.y][coord.x]
}
function is_empty(map,coord){
    return at(map,coord) === "E"
}

function get_stat_fn(stat_name){
    return function(game_state,coord){
        return calc_stat(game_state.stats,at(game_state.map,coord),stat_name)
    }
}
function all_coords(game_state){
    var res = []
    for(var y = 0; y < game_state.map.length; y++){
        for(var x = 0; x < game_state.map[y].length; x++){
            res.push({x:x,y:y})
        }
    }
    return res;
}
function is_valid(game_state,coord){
    if(!game_state){
        return true
    }
    var map = game_state.map
    return map && map[coord.y] && map[coord.y][coord.x];
}
function coords_around(game_state,center,range){
    var res = []
    for(var y = center.y-range; y <= center.y+range; y++){
        for(var x = center.x-range; x <= center.x+range; x++){
            var c = {x:x,y:y}
            if(is_valid(game_state,c)){
                res.push(c)
            }
        }
    }
    return res;
}
function is_unit(map,coord){
    return at(map,coord).category === "unit"
}
function is_mine(game_state,coord,myplayer){
    if(!myplayer){
        myplayer = game_state.my_player
    }
    if(!is_unit(game_state.map,coord)){
        return false
    }
    if(at(game_state.map,coord).player !== myplayer){
        return false
    }
    return true
}
function is_moveable_unit(game_state,coord){
    if(!is_unit(game_state.map,coord)){
        return false
    }
    if(!is_mine(game_state,coord)){
        return false
    }
    if(!module.exports.get_move_range(game_state,coord)){
        return false
    }
    return true
}
function is_build_radius_unit(game_state,coord){
    if(!is_unit(game_state.map,coord)){
        return false
    }
    if(!is_mine(game_state,coord)){
        return false
    }
    if(!module.exports.get_build_radius(game_state,coord)){
        return false
    }
    return true
}
function max_buildable_range(game_state){
    return Math.max.apply(null,
        Object.values(game_state.stats.unit_types)
        .filter(o=>o.buildable_radius)
        .map(o=>o.buildable_radius))
}
function find_tc(game_state,build_coord){
    var build_range = max_buildable_range(game_state)
    var rough_possible_coords = coords_around(game_state,build_coord,build_range)
    var possible_moves = pathing.get_possible_moves(game_state.map,build_coord,build_range,rough_possible_coords)
    var possible_tcs = possible_moves.filter((coord)=>is_build_radius_unit(game_state,coord))
    return possible_tcs.length ? possible_tcs[0] : null
}
function first_if_there(arr){
    return arr ? arr[0] : null
}
function get_make_equip(gs,c){
    return first_if_there(get_stat_fn("can_make_equip")(gs,c))
}
function get_make_unit(gs,c){
    return first_if_there(get_stat_fn("can_make")(gs,c))
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function deep_equals(o1,o2){
    return JSON.stringify(o1) ===  JSON.stringify(o2)
}

function map_to_state_changes(game_state){
    var state_change_signals =  [{type:"CLEAR"}]
    all_coords(game_state).forEach(function(coord){
        if(is_unit(game_state.map,coord)){
            var unit = at(game_state.map,coord)
            state_change_signals.push({
                type:"CREATE",
                data:unit,
                coord: coord,
            })
            unit.attachments.forEach(function(attach){
                state_change_signals.push({
                    type: "ADD_EQUIPMENT",
                    coord: coord,
                    equip_type: attach,
                })
            })
            for(var stat in unit.status){
                state_change_signals.push({
                    type: "SET_STATUS",
                    coord: coord,
                    status_key: stat,
                    new_status: unit.status[stat],
                })
            }
        }
    })
    return state_change_signals
}

function get_current_income(gamestate,player){
    var income = 0;
    gamestate.map.forEach(function(row){
        row.forEach(function(entry){
            if(entry.category === "unit" && entry.player === player){
                var unit_stats = gamestate.stats.unit_types[entry.unit_type]
                if(unit_stats.income){
                    income += unit_stats.income
                }
                if(unit_stats.upkeep){
                    income -= unit_stats.upkeep
                }
            }
        })
    })
    return income
}
function all_units_on_board(gamestate){
    var map = gamestate.map
    var all_units = []
    for(var y = 0; y < map.length; y++){
        for(var x = 0; x < map[y].length; x++){
            var coord = {x:x,y:y}
            var entry = at(map, coord)
            if(entry.category === "unit"){
                all_units.push({
                    coord: coord,
                    unit: entry,
                })
            }
        }
    }
    return all_units
}
function make_init_instr(state){
    var state_changes = map_to_state_changes(state)
    var money_changes = state.players.player_order.map(function(player){return{
           type: "SET_MONEY",
           player: player,
           amount: state.players.player_info[player].money,
    }})
    var all_changes = state_changes.concat(money_changes)
    var init_instr = {
        type: "GAME_STARTED",
        game_size: state.game_size,
        initial_creations: all_changes,
        player_order: state.players.player_order,
        initial_money: -1,//overwritten by money_changes
        stats: state.stats,
    }
    return init_instr;
}

module.exports = {
    map_to_state_changes: map_to_state_changes,
    make_init_instr: make_init_instr,
    get_possible_moves: pathing.get_possible_moves,
    is_possible_move: pathing.is_possible_move,
    is_possible_attack: pathing.is_possible_attack,
    get_shortest_path: pathing.get_shortest_path,
    distance: pathing.distance,
    get_move_range: get_stat_fn("move_range"),
    get_attack_range: get_stat_fn("attack_range"),
    get_build_radius: get_stat_fn("buildable_radius"),
    get_make_equip: get_make_equip,
    get_make_unit: get_make_unit,
    is_empty: is_empty,
    all_units_on_board: all_units_on_board,
    get_current_income: get_current_income,
    at: at,
    all_coords: all_coords,
    coords_around: coords_around,
    is_valid: is_valid,
    is_unit: is_unit,
    is_moveable_unit: is_moveable_unit,
    is_build_radius_unit: is_build_radius_unit,
    find_tc: find_tc,
    is_mine: is_mine,
    deep_copy: deep_copy,
    deep_equals: deep_equals,
}
