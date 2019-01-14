var types = require("../logic_modules/types.js")
var canv_inter = require("./game_display/canvas_interface.js")
var script_inter = require("./game_display/script_interface.js")
var base_inter = require("./game_display/base_component.js")
var signals = require("./game_display/global_signals.js")
var validate = require("../logic_modules/validate_instruction.js")
var decompose = require("../logic_modules/decompose_instructions.js")
var consume = require("../logic_modules/consume_instructions.js")
var clib = require("../logic_modules/coord_lib.js")
var init_game = require("../logic_modules/init_game.js")
var accessor = require("../logic_modules/record_accessor.js")
var nav_signal = require("./nav_signal.js")

class Analysis {
    constructor(signals,record,game_state){
        this.signals = signals
        this.accessor = null
        this.index_holder = null
        this.init_analysis_signals(record,game_state)
    }
    current_nav_state(){
        return this.accessor.get_state(this.index_holder.getMinor())
    }
    init_analysis_signals(record,game_state){
        this.signals.analysis_signal.listen(()=>{
            this.accessor = new accessor.RecordAccessor(record)
            this.index_holder = new accessor.MajorIndicies(record)
            this.index_holder.setMinor(this.index_holder.maxMinorIdx())
            this.draw_board(this.current_nav_state())
        })
        this.signals.stop_analysis_signal.listen(()=>{
            this.draw_board(game_state)
        })
        this.signals.analysisClickOccurred.listen((coord)=>{
            //save_analysis_choice(coord)
        })
        this.signals.analysis_navigation.listen(this.handle_analysis_navigation.bind(this))
    }
    handle_analysis_navigation(nav_instr){
        switch(nav_instr){
            case "FAST_FORWARD": this.index_holder.incMajor(); break;
            case "FAST_BACKWARD": this.index_holder.decMajor(); break;
            case "FORWARD": this.index_holder.incMinor(); break;
            case "BACKWARD": this.index_holder.decMinor(); break;
        }
        this.draw_board(this.current_nav_state())
    }
    draw_board(game_state){
        clib.map_to_state_changes(game_state).forEach((change)=>{
            this.signals.gameStateChange.fire(change)
        })
        game_state.players.player_order.forEach((player)=>{
            var money = game_state.players.player_info[player].money;
            this.signals.gameStateChange.fire({
                type: "SET_MONEY",
                amount: money,
                player: player,
            })
        })
        signals.activePlayer.setState(game_state.players.active_player)
    }
}
module.exports = {
    Analysis: Analysis,
}
