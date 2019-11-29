var MainAI = require("../logic_modules/ai_interface/main_ai_inter.js").MainAI
var ai_type_utils = require("../logic_modules/ai_interface/type_utils.js")
var flatten = require("../logic_modules/array_nd.js").flatten

var ai_is_loaded = false
var ai_load_callback = function(){}
function init_ai_code(){
    $.getScript("tf.min.js",function(){
        ai_is_loaded = true
        ai_load_callback()
    })
}
function delayed_init_main_ai(signals,game_state){
    if(ai_is_loaded){
        init_main_ai(signals,game_state)
    }
    else{
        ai_load_callback = function(){
            init_main_ai(signals,game_state)
        }
    }
}

function to_high_color(propmax){
    return "rgba(255,0,0,"+(propmax*0.5)+")"
}
function val_map_to_highlights(prob_map){
    var flat_probs = flatten(prob_map)
    var max = Math.max.apply(null,flat_probs)
    var highlight_list = []
    for(var y = 0; y < prob_map.length; y++){
        for(var x = 0; x < prob_map[y].length; x++){
            var color = to_high_color(prob_map[y][x] / max)
            var coord = {x:x,y:y}
            highlight_list.push({
                coord:coord,
                color:color,
            })
        }
    }
    return {
        draw_list: highlight_list,
        line_list: [],
    }
}
function init_main_ai(signals,game_state){
    var train_myplayer = 'chromeuser'
    var record_1 = JSON.parse(document.getElementById("long_game_record").innerHTML)
    var record_2 = JSON.parse(document.getElementById("other_long_game_record").innerHTML)
    var records = [record_2]
    var main_ai = new MainAI(records,train_myplayer)
    signals.ai_start_recomendation.listen(function(){
        signals.ai_recomended_move.setState(null)
        var myplayer = signals.myPlayer.getState()
        var old_game_state = signals.prev_game_state.getState()
        if(main_ai.is_trained() && old_game_state && old_game_state.players){
            main_ai.get_recomended_instr(game_state,old_game_state,myplayer,function(recomended){
                signals.ai_recomended_move.setState(recomended)
            })
        }
    })
    signals.ai_recomended_move.listen(function(instr){
        if(instr){
            var major_coord = ai_type_utils.major_coord(instr)
            var minor_coord = ai_type_utils.minor_coord(instr)
            var color_major = "rgba(128,128,128,0.4)"
            var color_minor = "rgba(255,0,0,0.4)"
            function to_item(coord,color){
                return {
                    coord: coord,
                    color: color,
                }
            }
            function to_line(c1,c2){
                return {
                    coord1: c1,
                    coord2: c2,
                }
            }
            if(minor_coord){
                var message = {
                    draw_list: [to_item(major_coord,color_major),to_item(minor_coord,color_minor)],
                    line_list: [to_line(minor_coord,major_coord)],
                }
            }
            else{
                var message = {
                    draw_list: [to_item(major_coord,color_major)],
                    line_list: [],
                }
            }
            signals.highlightCommand.fire(message)
        }
        else{
            signals.clear_highlights.fire()
        }
    })
    signals.ai_start_major_move_display.listen(function(){
        var myplayer = signals.myPlayer.getState()
        var old_game_state = signals.prev_game_state.getState()
        if(old_game_state && old_game_state.players){
            main_ai.get_prob_map(game_state,old_game_state,myplayer,function(prob_map){
                var highlights = val_map_to_highlights(prob_map)

                signals.highlightCommand.fire(highlights)
            })
        }
    })
    return main_ai
}
module.exports = {
    init_main_ai: init_main_ai,
    init_ai_code: init_ai_code,
    delayed_init_main_ai: delayed_init_main_ai,
}
