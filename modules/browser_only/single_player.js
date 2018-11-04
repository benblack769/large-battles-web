var load_images = require("./load_images.js")
var game_types = require("../logic_modules/types.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")
var base_inter = require("./game_display/base_component.js")
var signals = require("./game_display/global_signals.js")

var my_web_worker = new Worker("web_worker.js")

function switch_to_single_player(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
    window.scrollTo(80, 40);
}

class GameInterface extends base_inter.BaseComponent {
    constructor(parent,basediv,gamesize){
        super(parent,basediv)
        this.gameboard = new canv_inter.GameBoard(this,basediv,gamesize)
        this.script_inter = new script_inter.ScriptInterface(this,(basediv))
    }
    children(){
        return [this.gameboard, this.script_inter]
    }
}
function process_clicks(clicks, click_num){
    console.log("process clicks")
    console.log(clicks)
    console.log(click_num)
    my_web_worker.postMessage({
        type: "ACTIVATE_FUNCTION",
        args: clicks,
    })
}

function init_single_player(){
    var basediv = document.getElementById("single_page_game_overlay")
    var gamesize = {
        xsize: 90,
        ysize: 60,
    }
    load_images.on_load_all_images(game_types.get_all_sources(),function(){
        var base = new GameInterface(null, basediv, gamesize)
    })
    signals.clickCycleFinished.listen(function(clicks){
        process_clicks(clicks, signals.selectedData.getState().click_num)
    })
    signals.selectedData.listen(function(data){
        console.log(data)
        my_web_worker.postMessage({
            type: "REPLACE_FUNCTION",
            js_str: data.js_file,
        })
    })
    /*var obj = JSON.stringify({
        hithere: 123,
        bob: "green"
    },null,4)
    make_change_script_popup(obj,JSON.parse,function(res_val){
        console.log(res_val)
    })*/
}

module.exports = {
    switch_to_single_player: switch_to_single_player,
    init_single_player: init_single_player,
}
