var test = require('tape')
var validate = require('../validate_instruction.js').validate_instruction
var init_game = require('../init_game.js')
var create_utils = require('../create_utils.js')

var test_player_state = {
    players_info: {
        "bp": {
            money: 120,
        },
        "op": {
            money: 120,
        }
    },
    players_order: [
        "bp",
        "op",
    ],
}
var game_size = {xsize:5, ysize:6}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function make_game_state(){
    var game_state = {
        map: init_game.init_map(game_size),
        players: deep_copy(test_player_state)
    }
    return game_state
}
function place_unit(map,coord,player,type){
    var unit = {
        "category": "unit",
        "player": player,
        "unit_type": type,
    }
    map[coord.y][coord.x] = unit
}

test('validate', function (t) {
    var game = make_game_state()
    var unit_coord = {x:2,y:3}
    place_unit(game.map,unit_coord,"bp","soldier")
    var move_coord = {x:3,y:3}
    var instr = {
        type:"MOVE",
        start_coord: unit_coord,
        end_coord: move_coord,
    }
    t.false(validate(game,instr,"bp"))
    t.true(validate(game,instr,"op"))
    t.end()
})
