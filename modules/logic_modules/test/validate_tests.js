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
            "fastunit": {
                "attack_range": 1,
                "move_range": 3,
            },
            "rangedunit": {
                "attack_range": 3,
                "move_range": 1,
            },
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

function create_active_unit(unit_type,player_id){
    var unit = create_utils.create_unit(unit_type,player_id)
    unit.status.moved = false
    return unit
}
function ee(){
    return create_utils.create_empty()
}
function F1(){
    return create_active_unit("fastunit", "p1")
}
function F2(){
    return create_active_unit("fastunit", "p2")
}
function R1(){
    return create_active_unit("rangedunit", "p1")
}
function R2(){
    return create_active_unit("rangedunit", "p2")
}
function make_game_map(){
    return [
        [ee(),ee(),ee(),F2(),ee()],
        [ee(),F1(),ee(),F2(),ee()],
        [ee(),F1(),F1(),F2(),ee()],
        [ee(),F1(),ee(),ee(),ee()],
        [R1(),F1(),F2(),ee(),ee()],
        [ee(),ee(),ee(),ee(),R2()],
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

test('validate_move_emptiness', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "MOVE",
        start_coord: {x:0,y:0},
        end_coord: {x:0,y:1},
    }
    var instr2 = {
        type: "MOVE",
        start_coord: {x:1,y:1},
        end_coord: {x:1,y:1},
    }
    var instr3 = {
        type: "MOVE",
        start_coord: {x:1,y:1},
        end_coord: {x:1,y:2},
    }
    t.true(validate(game,instr1,"p1"))
    t.true(validate(game,instr2,"p1"))
    t.true(validate(game,instr3,"p1"))
    t.end()
})
test('validate_hasnt_moved', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "MOVE",
        start_coord: {x:1,y:1},
        end_coord: {x:0,y:0},
    }
    game.map[1][1].status.moved = true
    t.true(validate(game,instr1,"p2"))
    t.end()
})
test('validate_move_player', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "MOVE",
        start_coord: {x:1,y:1},
        end_coord: {x:0,y:0},
    }
    t.false(validate(game,instr1,"p1"))
    t.true(validate(game,instr1,"p2"))
    t.end()
})
test('validate_move_path', function (t) {
    var game = make_game_state()
    var instr1 = {
        type: "MOVE",
        start_coord: {x:2,y:2},
        end_coord: {x:0,y:1},
    }
    t.false(validate(game,instr1,"p1"))
    var instr2 = {
        type: "MOVE",
        start_coord: {x:2,y:2},
        end_coord: {x:0,y:2},
    }
    t.true(validate(game,instr2,"p1"))
    var instr3 = {
        type: "MOVE",
        start_coord: {x:4,y:5},
        end_coord: {x:0,y:2},
    }
    //test long ranged units
    game.stats.unit_types.rangedunit.move_range = 10
    t.true(validate(game,instr3,"p2"))
    game.map[2][2] = create_utils.create_empty()
    t.false(validate(game,instr3,"p2"))
    t.end()
})
