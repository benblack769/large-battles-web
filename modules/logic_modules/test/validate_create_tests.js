var test = require('tape')
var validate = require('../validate_instruction.js').validate_instruction
var init_game = require('../init_game.js')
var create_utils = require('../create_utils.js')

function make_stats(){
    return {
        "unit_types": {
            "cheap_building": {
                "cost": 20,
                "buildable": true,
            }
        },
    }
}
function make_player_state(m1, m2){
    return {
        player_info: {
            "p1": {
                money: m1,
            },
            "p2": {
                money: m2,
            }
        },
        players_order: [
            "p1",
            "p2",
        ],
    }
}

function ee(){
    return create_utils.create_empty()
}
function F1(){
    return create_utils.create_unit("cheap_building", "p1")
}
function make_game_map(){
    return [
        [ee(),ee(),ee(),ee()],
        [ee(),ee(),ee(),ee()],
        [ee(),ee(),ee(),ee()],
        [ee(),ee(),F1(),ee()],
    ]
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function make_game_state(){
    return {
        map: make_game_map(),
        players: make_player_state(120,120),
        stats: make_stats(),
    }
}

test('validate_build_over', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "BUILD",
        coord: {x:2,y:3},
        building_type: "cheap_building",
    }
    t.true(validate(game,instr1,"p1"))
    t.end()
})

test('validate_money_build', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "BUILD",
        coord: {x:0,y:0},
        building_type: "cheap_building",
    }
    t.false(validate(game,instr1,"p1"))
    game.players.player_info["p1"].money = 5
    t.true(validate(game,instr1,"p1"))
    t.end()
})
