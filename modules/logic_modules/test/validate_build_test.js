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
function U1(){
    return create_utils.create_unit("unit_making_building", "p1")
}
function E1(){
    return create_utils.create_unit("attachment_making_building", "p1")
}
function A1(){
    return create_utils.create_unit("attachable_unit", "p1")
}
function make_game_map(){
    return [
        [ee(),ee(),ee(),C1()],
        [ee(),ee(),ee(),A1()],
        [ee(),ee(),ee(),E1()],
        [ee(),U1(),C1(),ee()],
    ]
}
function O1(){
    return {
        "p1": 100,
        "p2": 1,
    }
}
function O2(){
    return {
        "p1": 1,
        "p2": 1000,
    }
}
function SS(){
    return {
        "p1": 50,
        "p2": 50,
    }
}
function S1(){
    return {
        "p1": 5,
        "p2": 0,
    }
}
function oe(){
    return {
        "p1": 0,
        "p2": 0,
    }
}
function make_occ(state){
    return [
        [O1(),oe(),oe(),oe()],
        [O2(),O1(),oe(),oe()],
        [SS(),oe(),oe(),oe()],
        [S1(),oe(),O1(),oe()],
    ]
}
function make_game_state(){
    var state =  {
        map: make_game_map(),
        players: make_player_state(120,120),
        stats: make_stats(),
        occupied: make_occ(),
    }
    return state
}

test('validate_occpation', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "BUILD",
        coord: {x:0,y:0},
        building_type: "cheap_building",
    }
    t.false(validate(game,instr1,"p1"),"GOOD")
    instr1.coord = {x:0,y:1}
    t.true(validate(game,instr1,"p1"),"OCCUPIED_BY_P2")
    instr1.coord = {x:0,y:2}
    t.true(validate(game,instr1,"p1"),"SPLIT_OCCUPATION")
    instr1.coord = {x:0,y:2}
    t.true(validate(game,instr1,"p1"),"SMALL_OCCUPATION")
    t.end()
})
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
        coord: {x:1,y:1},
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
    game.players.active_player = "p2"
    game.occupied[0][0] = O2()
    t.true(validate(game,instr1,"p1"),"NOT_ACTIVE_PLAYER")
    t.false(validate(game,instr1,"p2"),"GOOD")
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
