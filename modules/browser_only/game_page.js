var types = require("../logic_modules/types.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")
var interaction_comps = require("./game_display/interaction_components.js")
var base_inter = require("./game_display/base_component.js")
var signals = require("./game_display/global_signals.js")
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var init_game = require("../logic_modules/init_game.js")
var nav_signal = require("./nav_signal.js")
var analysis = require("./analysis.js")

var local_game_record = []
function set_player_colors(players_order){
    var pcolors = {}
    var color_cycle = ["red","blue"]
    for(var i = 0; i < players_order.length; i++){
        pcolors[players_order[i]] = color_cycle[i]
    }
    signals.playerColors.setState(pcolors)
}
class GameInterface extends base_inter.BaseComponent {
    constructor(parent,basediv,gamesize,init_player_state){
        super(parent,basediv)
        this.gameboard = new canv_inter.GameBoard(this,basediv,gamesize)
        this.script_inter = new script_inter.ScriptInterface(this,(basediv))
        this.player_info = new script_inter.PlayerInfoPannel(this,basediv,init_player_state)
    }
}

function switch_to_game_page(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
    window.scrollTo(80, 40);
    document.body.style["background-color"] = "gray"
}
function switch_away_from_game_page(){
    document.body.style["background-color"] = "white"
}
function init_game_page(){
    $(document).keyup(function(e) {
         if (e.key === "Escape" || e.keycode === 27) {
             signals.selectedData.setState(signals.selectedData.getState())
        }
    });
    $("#goto_live_games").click(function(){
        nav_signal.change_page.fire("live_connect_naventry")
    })
}

function init_signals(game_state){
    signals.clickOccurred.listen((coord) => {
        interaction_comps.handle_click(coord,game_state,signals.myPlayer.getState())
    })
    signals.selectedData.listen(function(id){
        console.log(id+" selected")
        interaction_comps.set_fn(id,game_state,signals.myPlayer.getState())
    })
    signals.gameStateChange.listen(function(instr){
        if(instr.type === "SET_ACTIVE_PLAYER"){
            signals.activePlayer.setState(instr.player)
        }
    })
    analysis.init_analysis_signals(local_game_record,game_state)
}
function init_html_ui(gamesize,player_order){
    $(".player_info_bar").show()
    $("#game_not_started_message").hide()
    var basediv = document.getElementById("single_page_game_overlay")
    basediv.innerHTML = ""
    set_player_colors(player_order)
    var base = new GameInterface(null, basediv, gamesize, player_order)
}

function process_message_frontend(game_state,instruction,player,on_backend_message){
    if(instruction.type === "DRAW_RECTS"){
        signals.highlightCommand.fire(instruction)
    }
    else{
        var error = validate.validate_instruction(game_state,instruction,player)
        if(error){
            console.log("ERROR "+error.name+": \n"+error.message)
            if(error.name !== "Error"){
                console.log(error)
            }
        }
        else{
            local_game_record.push(instruction)
            on_backend_message(game_state,instruction,player)
        }
    }
}
module.exports = {
    switch_away_from_game_page: switch_away_from_game_page,
    switch_to_game_page: switch_to_game_page,
    init_game_page: init_game_page,
    process_message_frontend: process_message_frontend,
    init_signals: init_signals,
    init_html_ui: init_html_ui,
}
