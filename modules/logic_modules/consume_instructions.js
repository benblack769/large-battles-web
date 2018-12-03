var create_utils = require('./create_utils.js')
var init_game = require('./init_game.js')

function at(map, coord){
    return map[coord.y][coord.x]
}
function set(map, coord, val){
    map[coord.y][coord.x] = val
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function consume_move(game_state, instr){
    var sc = instr.start_coord
    var ec = instr.end_coord
    var map = game_state.map
    var obj = at(map,sc)
    set(map,ec,obj)
    set(map,sc,create_utils.create_empty())
}
function consume_create(game_state, instr){
    set(game_state.map,instr.coord,instr.data)
}
function consume_status_change(game_state,instr){
    var unit = at(game_state.map, instr.coord)
    unit.status[instr.status_key] = instr.new_status
}
function consume_money_change(game_state,instr){
    game_state.players.player_info[instr.player].money = instr.amount;
}
function consume_set_active_player(game_state,instr){
    game_state.players.active_player = instr.player
}
function consume_add_equip(game_state,instr){
    var target = at(game_state.map,instr.coord)
    target.attachments.push(instr.equip_type)
}
function init_game_state(game_state,instr){
    game_state.map = init_game.init_map(instr.game_size)
    game_state.stats = instr.stats
    var player_info = {}
    instr.player_order.forEach(function(player){
        player_info[player] = {}
    })
    game_state.players = {
        player_order: instr.player_order,
        player_info: player_info,
    }
    game_state.occupied = init_game.init_oppupied(instr.game_size,instr.player_order)
}
function consume_destroy(game_state,instr){
    set(game_state.map,instr.coord,create_utils.create_empty())
}
function get_iter_coord(ocmap,xc,yc,player){
    var orig_val = ocmap[yc][xc][player]
    var sum = -orig_val;
    for(var y = Math.max(0,yc-1); y <= Math.min(yc+1,ocmap.length-1); y++){
        for(var x = Math.max(0,xc-1); x <= Math.min(xc+1,ocmap[y].length-1); x++){
            sum += ocmap[y][x][player]
        }
    }
    var num_squares = 8;
    return (orig_val + (sum / num_squares)) * 0.5
}
function update_iter(map,ocmap){
    set_unit_val(map,ocmap)
    var new_map = deep_copy(ocmap)
    for(var y = 0; y < ocmap.length; y++){
        for(var x = 0; x < ocmap[y].length; x++){
            for(var player in ocmap[y][x]){
                new_map[y][x][player] = get_iter_coord(ocmap,x,y,player)
            }
        }
    }
    return new_map
}
function set_unit_val(map,ocmap){
    for(var y = 0; y < ocmap.length; y++){
        for(var x = 0; x < ocmap[y].length; x++){
            var unit = map[y][x]
            if(unit.category === "unit"){
                var occ = ocmap[y][x]
                for(var p in occ){
                    occ[p] = 0
                }
                occ[unit.player] = 100
            }
        }
    }
}
function update_occupied(game_state){
    var ocmap = game_state.occupied
    for(var i = 0; i < 10; i++){
        ocmap = update_iter(game_state.map,ocmap)
    }
    set_unit_val(game_state.map,ocmap)
    game_state.occupied = ocmap
}
function on_victory(){
    // a no-op because this functionality needs to be handled elsewhere.
}
var consume_funcs = {
    "VICTORY": on_victory,
    "MOVE": consume_move,
    "DESTROY_UNIT": consume_destroy,
    "CREATE": consume_create,
    "ADD_EQUIPMENT": consume_add_equip,
    "SET_STATUS": consume_status_change,
    "SET_MONEY": consume_money_change,
    "SET_ACTIVE_PLAYER": consume_set_active_player,
    "INIT_GAME_STATE": init_game_state,
    "UPDATE_OCCUPIED": update_occupied,
}
function consume_change(gamestate, instr){
    consume_funcs[instr.type](gamestate,instr)
}

module.exports = {
    consume_change: consume_change,
}
