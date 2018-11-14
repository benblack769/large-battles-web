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
            "unit_making_building": {
                "cost": 47,
                "buildable": true,
                "can_make": ["unit_to_make"],
            },
            "attachment_making_building": {
                "cost": 51,
                "buildable": true,
                "can_make_equip": ["basic_attachment"],
            },
            "unit_to_make": {
                "cost": 19,
            },
            "attachable_unit": {
                "cost": 21,
                "random_stat": 5,
                "viable_attachments": ["basic_attachment"],
            }
        },
        "attachment_types": {
            "basic_attachment":{
                "cost": 31,
                "stat_alt": {
                    "random_stat": 3,
                }
            }
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
        players_order: [
            "p1",
            "p2",
        ],
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

test('validate_buy_unit', function (t) {
    var game = make_game_state()
    var instr = {
        type: "BUY_UNIT",
        placement_coord: {x:2,y:2},
        building_coord: {x:3,y:2},
        buy_type: "unit_to_make",
    }
    t.true(validate(game,instr,"p1"),"EMPTY_BUILDING")
    instr.building_coord = {x:2, y:3}
    t.true(validate(game,instr,"p1"),"BUILDING_WRONG_TYPE")
    instr.building_coord = {x:1, y:3}
    t.true(validate(game,instr,"p1"),"BUILDING_NO_BUYS_LEFT")
    at(game.map,instr.building_coord).status.buys_left = 2
    t.false(validate(game,instr,"p1"),"GOOD")
    game.players.player_info["p1"].money = 5
    t.true(validate(game,instr,"p1"),"NO_MONEY_TO_BUY")
    game.players.player_info["p1"].money = 100
    t.false(validate(game,instr,"p1"), "GOOD")
    instr.placement_coord = {x:1, y:3}
    t.true(validate(game,instr,"p1"),"PLACED_ON_TOP_OF_UNIT")
    t.end()
})

test('validate_equip_unit', function (t) {
    var game = make_game_state()
    var instr = {
        type: "BUY_ATTACHMENT",
        equip_coord: {x:3,y:1},
        building_coord: {x:3,y:2},
        equip_type: "basic_attachment",
    }
    at(game.map,instr.building_coord).status.buys_left = 1
    t.false(validate(game,instr,"p1"),"GOOD")
    at(game.map,instr.building_coord).status.buys_left = 0
    t.true(validate(game,instr,"p1"),"NO_BUYS_LEFT")
    at(game.map,instr.building_coord).status.buys_left = 1
    game.players.player_info["p1"].money = 5
    t.true(validate(game,instr,"p1"),"NOT_ENOUGH_MONEY")
    game.players.player_info["p1"].money = 500
    t.false(validate(game,instr,"p1"),"GOOD")
    instr.equip_coord = {x:2, y:3}
    t.true(validate(game,instr,"p1"),"BAD_TARGET_TO_EQUIP")
    instr.equip_coord = {x:3,y:1}
    t.false(validate(game,instr,"p1"),"GOOD")
    instr.building_coord = {x:3,y:0}
    t.true(validate(game,instr,"p1"),"BAD_BUILDING_TO_PRODUCE")
    instr.building_coord = {x:3,y:2}
    t.false(validate(game,instr,"p1"),"GOOD")
    at(game.map,instr.equip_coord).attachments.push("basic_attachment")
    t.true(validate(game,instr,"p1"),"ALREADY_HAS_ATTACHMENT")


    t.end()
})
