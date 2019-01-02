var types = require("../logic_modules/types.js")
var init_game = require("../logic_modules/init_game.js")
var clib = require("../logic_modules/coord_lib.js")
var nav_signal = require("./nav_signal.js")
var SinglePlayerGame = require("./single_player_interface.js").SinglePlayerGame

var single_player_players = [
    "Player A",
    "Player B",
]

function switch_to_train_page(){
    console.log("switched to train player")
    $(".page_level").hide()
    $("#training_page").show()
}
function make_train_comparison(state1, state2){
    var basediv1 = document.getElementById("train_pan_1")
    var basediv2 = document.getElementById("train_pan_2")
    var init_instr1 = clib.make_init_instr(state1)
    var init_instr2 = clib.make_init_instr(state2)

    var g1 = new SinglePlayerGame(basediv1,init_instr1)
    var g2 = new SinglePlayerGame(basediv2,init_instr2)
}
function init_train_page(){
    var record = JSON.parse(document.getElementById("long_game_record").innerHTML)
    var end_game_state = clib.process_record_til_end(record)
    var end_game_state2 = clib.process_record_til_end(record.slice(0,record.length-1))
    make_train_comparison(end_game_state,end_game_state2)
}


module.exports = {
    switch_to_train_page: switch_to_train_page,
    init_train_page: init_train_page,
}
