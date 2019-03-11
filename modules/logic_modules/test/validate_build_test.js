var test = require('tape')
var a_validate = require('../validate_instruction.js').validate_instruction
var init_game = require('../init_game.js')
var create_utils = require('../create_utils.js')
var validate = function(g,i,p){
    var res = a_validate(g,i,p)
    console.log(res ? res.message: "null")
    return res
}

function make_stats(){
    return {
        "unit_types": {
            "cheap_building": {
                "cost": 20,
                "buildable": true,
            },
            "buildable_around_building": {
                "cost": 50,
                "buildable": true,
                "buildable_radius": 2,
            },
        }
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
        player_order: [
            "p1",
            "p2",
        ],
        active_player: "p1",
    }
}

function at(map, coord){
    return map[coord.y][coord.x]
}
function ee(){
    return create_utils.create_empty()
}
function C1(){
    return create_utils.create_unit("cheap_building", "p1")
}
function T1(){
    return create_utils.create_unit("buildable_around_building", "p1")
}
function T2(){
    return create_utils.create_unit("buildable_around_building", "p2")
}
function make_game_map(){
    return [
        [ee(),ee(),ee(),C1()],
        [ee(),T1(),ee(),C1()],
        [ee(),ee(),ee(),C1()],
        [ee(),C1(),C1(),ee()],
        [ee(),ee(),ee(),ee()],
    ]
}
function make_game_state(){
    var state =  {
        map: make_game_map(),
        players: make_player_state(120,120),
        stats: make_stats(),
    }
    return state
}
test('validate_build_over', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "BUILD",
        coord: {x:2,y:3},
        building_type: "cheap_building",
    }
    t.true(validate(game,instr1,"p1"),"BUILD_OVER")
    t.end()
})
test('validate_build_type', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "BUILD",
        coord: {x:1,y:2},
        building_type: "bad_build_type",
    }
    t.true(validate(game,instr1,"p1"),"BAD_BUILD_TYPE")
    t.end()
})

test('validate_active_player', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "BUILD",
        coord: {x:0,y:0},
        building_type: "cheap_building",
    }
    t.false(validate(game,instr1,"p1"),"GOOD")
    game.map[1][1] = T2()
    t.true(validate(game,instr1,"p2"),"NOT_ACTIVE_PLAYER")
    game.players.active_player = "p2"
    t.false(validate(game,instr1,"p2"),"GOOD")
    game.map[1][1] = T1()
    t.true(validate(game,instr1,"p1"),"NOT_ACTIVE_PLAYER")
    t.end()
})
test('validate_money_build', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "BUILD",
        coord: {x:0,y:0},
        building_type: "cheap_building",
    }
    t.false(validate(game,instr1,"p1"),"GOOD")
    game.players.player_info["p1"].money = 5
    t.true(validate(game,instr1,"p1"),"NO_MONEY")
    t.end()
})
