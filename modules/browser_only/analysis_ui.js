var Analysis = require("./analysis.js").Analysis
var all_signals = require("./game_display/global_signals.js").all_signals
var clib = require("../logic_modules/coord_lib.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")


function set_player_colors(players_order,signals){
    var pcolors = {}
    var color_cycle = ["red","blue"]
    for(var i = 0; i < players_order.length; i++){
        pcolors[players_order[i]] = color_cycle[i]
    }
    signals.playerColors.setState(pcolors)
}
class GameInterface {
    constructor(parent,basediv,gamesize,init_player_state,signals){
        this.gameboard = new canv_inter.GameBoard(this,basediv,gamesize,signals)
        //this.script_inter = new script_inter.ScriptInterface(this,(basediv),signals)
        this.player_info = new script_inter.PlayerInfoPannel(this,basediv,init_player_state,signals)
        this.unit_info = new script_inter.UnitInfoPannel(this,basediv,signals)
        //this.ai_recomend = new script_inter.AIRecomendations(this,basediv,signals)
    }
}
function init_html_ui(basediv,gamesize,player_order,signals){
    basediv.innerHTML = ""
    set_player_colors(player_order,signals)
    return new GameInterface(null, basediv, gamesize, player_order, signals)
}

class AnalysisUI {
    constructor(record,basediv){
        var signals = new all_signals()
        //var game_state = {}
        this.basediv = basediv
        this.signals = signals
        var initial_instr = record[0]
        //this.game_state = game_state
        this.game_record = record

        //init_signals_single_player(game_state,this.game_record,signals)
        this.ui = init_html_ui(basediv,initial_instr.game_size,initial_instr.player_order,signals)
        this.analysis = new Analysis(signals,record,{})
        this.signals.analysis_signal.fire()
    }
}
module.exports = {
    AnalysisUI: AnalysisUI,
}
