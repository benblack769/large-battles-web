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
            "strong_unit": {
                "attack_range": 1,
                "attack_strength": 2,
                "max_HP": 3,
            },
            "ranged_unit": {
                "attack_range": 3,
                "attack_strength": 1,
                "max_HP": 1,
            },
        },
    }
}
function make_player_state(m1, m2){
    return {
        player_order: [
            "p1",
            "p2",
        ],
        active_player: "p1",
    }
}

function create_active_unit(unit_type,player_id){
    var unit = create_utils.create_unit(unit_type,player_id)
    unit.status.attacked = false
    return unit
}
function ee(){
    return create_utils.create_empty()
}
function S1(){
    return create_active_unit("strong_unit", "p1")
}
function S2(){
    return create_active_unit("strong_unit", "p2")
}
function R1(){
    return create_active_unit("ranged_unit", "p1")
}
function R2(){
    return create_active_unit("ranged_unit", "p2")
}
function make_target_map(){
    return [
        [ee(),ee(),S2(),ee(),ee()],
        [ee(),ee(),ee(),ee(),ee()],
        [S2(),ee(),R1(),ee(),S2()],
        [ee(),ee(),ee(),ee(),ee()],
        [ee(),ee(),S2(),ee(),ee()],
    ]
}
function make_blocked_map(){
    return [
        [ee(),ee(),S2(),ee(),ee()],
        [ee(),ee(),S1(),ee(),ee()],
        [S2(),S1(),R1(),S1(),S2()],
        [ee(),ee(),S2(),ee(),ee()],
        [ee(),ee(),S2(),ee(),ee()],
    ]
}
function make_single_range_map(){
    return [
        [S1(),ee(),S2(),ee(),ee()],
        [ee(),ee(),S1(),ee(),ee()],
        [ee(),ee(),R1(),S2(),ee()],
        [ee(),ee(),ee(),ee(),ee()],
        [ee(),ee(),ee(),R1(),ee()],
    ]
}
function deep_copy(obj){
    return JSON.parse(JSON.stringify(obj))
}
function make_game_state(map){
    return {
        map: map,
        players: make_player_state(120,120),
        stats: make_stats(),
    }
}
var end_coords = [
    {x:0,y:2},
    {x:4,y:2},
    {x:2,y:0},
    {x:2,y:4},
]

test('validate_attack_blocked', function (t) {
    var map = make_blocked_map()
    var game = make_game_state(map)
    end_coords.forEach(function(coord){
        var instr1 = {
            type: "ATTACK",
            source_coord: {x:2,y:2},
            target_coord: coord,
        }
        t.true(validate(game,instr1,"p1"))
    })
    t.end()
})

test('validate_attack_ranged', function (t) {
    var map = make_target_map()
    var game = make_game_state(map)
    end_coords.forEach(function(coord){
        var instr1 = {
            type: "ATTACK",
            source_coord: {x:2,y:2},
            target_coord: coord,
        }
        t.false(validate(game,instr1,"p1"))
    })
    t.end()
})

test('validate_attack_single_range', function (t) {
    var map = make_single_range_map()
    var game = make_game_state(map)
    var instr1 = {
        type: "ATTACK",
        source_coord: {x:2,y:2},
        target_coord: {x:3,y:2},
    }
    t.false(validate(game,instr1,"p1"))
    instr1 = {
        type: "ATTACK",
        source_coord: {x:0,y:0},
        target_coord: {x:2,y:0},
    }
    t.true(validate(game,instr1,"p1"))
    instr1 = {
        type: "ATTACK",
        source_coord: {x:2,y:1},
        target_coord: {x:2,y:0},
    }
    t.false(validate(game,instr1,"p1"))
    t.end()
})
