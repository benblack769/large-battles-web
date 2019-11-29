var types = require("../logic_modules/types.js")
var init_game = require("../logic_modules/init_game.js")
var clib = require("../logic_modules/coord_lib.js")
var nav_signal = require("./nav_signal.js")
var SinglePlayerGame = require("./player_interface.js").SinglePlayerGame
var MainCoordLearner = require("../logic_modules/ai_interface/major_coord_learner.js").MainCoordLearner
var StateComparitor = require("../logic_modules/ai_interface/state_comparitor.js").StateComparitor
var sample_move = require("../logic_modules/ai_interface/sample_move.js")
var flatten = require("../logic_modules/array_nd.js").flatten
//var learning = require("../logic_modules/ai_interface/minor_coord_learner.js")

var single_player_players = [
    "Player A",
    "Player B",
]
var has_switched = false;
function switch_to_train_page(){
    console.log("switched to train player")
    $(".page_level").hide()
    $("#training_page").show()
    if(!has_switched){
        old_record_show()
        has_switched = true
    }
}
function old_record_show(){
    var record = JSON.parse(document.getElementById("long_game_record").innerHTML)
    record = record.slice(0,record.length-25)
    var myplayer = "firefoxuser";
    var end_game_state = clib.process_record_til_end(record)
    var basediv1 = document.getElementById("best_move_pannel")

    var init_instr1 = clib.make_init_instr(end_game_state)

    var g1 = new SinglePlayerGame(basediv1,init_instr1)
}
/*function make_train_comparison(state1, state2){
    var basediv1 = document.getElementById("train_pan_1")
    var basediv2 = document.getElementById("train_pan_2")
    var init_instr1 = clib.make_init_instr(state1)
    var init_instr2 = clib.make_init_instr(state2)

    var g1 = new SinglePlayerGame(basediv1,init_instr1)
    var g2 = new SinglePlayerGame(basediv2,init_instr2)
}*/
/*function make_best_move_page(record){

}*/
function example_prob_map(){
    const xsize = 35;
    const ysize = 35;
    let res = new Array(ysize);
    for(var y = 0; y < ysize; y++){
        let row = new Array(xsize)
        for(var x = 0; x < xsize; x++){
            row[x] = x/xsize+y/ysize;
        }
        res[y] = row
    }
    return res
}
function draw_prob_map(game_state,prob_map){
    var basediv1 = document.getElementById("best_move_pannel")

    var init_instr1 = clib.make_init_instr(game_state)

    var g1 = new SinglePlayerGame(basediv1,init_instr1)
    g1.signals.clear_highlights.fire()
    g1.signals.clear_highlights.clear()
    g1.signals.highlightCommand.clear()
    g1.ui.gameboard.highlight_canvas.onHighlightCommand(val_map_to_highlights(prob_map))
}
function array_to_map(prob_array,game_size){
    var res = new Array(game_size.ysize)
    for(var y = 0; y < game_size.ysize; y++){
        res[y] = Array.prototype.slice.call(prob_array.slice(y*game_size.xsize,(y+1)*game_size.xsize))
    }
    return res;
}
function train_show_example_map(){

    var record = JSON.parse(document.getElementById("long_game_record").innerHTML)
    //record = record.slice(0,record.length-25)
    var end_game_state = clib.process_record_til_end(record)
    var examp_map = example_prob_map()
    var myplayer = "chromeuser";
    draw_prob_map(end_game_state,examp_map)
    var moves = sample_move.sample_moves(end_game_state,examp_map,myplayer,50)
    console.log(moves)
    //console.log(prob_map)
}
function train_compairitor(){
    var record = JSON.parse(document.getElementById("long_game_record").innerHTML)
    record = record.slice(0,record.length-25)
    var myplayer = "firefoxuser";
    var end_game_state = clib.process_record_til_end(record)
    //draw_prob_map(end_game_state,example_prob_map())
    var learner = new StateComparitor(record[0].game_size);
    learner.train_on([record],myplayer,function(){
        //var major_coord = {x:14,y:19}
        console.log("callback called")
       /*learner.get_prob_map(end_game_state,myplayer,function(prob_array){
           var prob_map = prob_array
           var moves = sample_move.sample_moves(end_game_state,prob_map,myplayer,20)
           console.log("moves")
           console.log(moves)
           draw_prob_map(end_game_state,prob_map)
       })*/
   })
}
function train_map_show(){
    var record = JSON.parse(document.getElementById("long_game_record").innerHTML)
    record = record.slice(0,record.length-25)
    var myplayer = "firefoxuser";
    var end_game_state = clib.process_record_til_end(record)
    //draw_prob_map(end_game_state,example_prob_map())
    var learner = new MainCoordLearner(record[0].game_size);
    learner.train_on([record],myplayer,function(){
        //var major_coord = {x:14,y:19}
       learner.get_prob_map(end_game_state,myplayer,function(prob_array){
           var prob_map = prob_array
           var moves = sample_move.sample_moves(end_game_state,prob_map,myplayer,20)
           console.log("moves")
           console.log(moves)
           draw_prob_map(end_game_state,prob_map)
       })
   })
}
function init_train_page(){
    //var end_game_state2 = clib.process_record_til_end(record.slice(0,record.length-1))
    //make_train_comparison(end_game_state,end_game_state2)
}


module.exports = {
    switch_to_train_page: switch_to_train_page,
    init_train_page: init_train_page,
}
