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
var type_utils = require("../logic_modules/ai_interface/type_utils.js")
var nav_signal = require("./nav_signal.js")

class Analysis {
    constructor(signals,record,game_state){
        this.signals = signals
        this.record = record
        this.accessor = new accessor.RecordAccessor(record)
        this.index_holder = new accessor.MajorIndicies(record)
        this.index_holder.setMinor(this.index_holder.maxMinorIdx())
        this.draw(this.current_nav_state(),this.final_nav_instr())
        this.init_analysis_signals(record,game_state)
    }
    current_nav_state(){
        return this.accessor.get_state(this.index_holder.getMinor())
    }
    final_nav_instr(){
        return this.record[this.index_holder.getMinor()]
    }
    init_analysis_signals(record,game_state){
        this.signals.stop_analysis_signal.listen(()=>{
        //    this.draw_board(game_state)
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
        this.draw(this.current_nav_state(),this.final_nav_instr())
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
        this.signals.activePlayer.setState(game_state.players.active_player)
        this.signals.game_state_changed.fire(game_state)
    }
    draw(game_state,final_instr){
        this.draw_board(game_state)
        this.display_unitinfo(game_state)
        this.highlight_move(final_instr)
    }
    display_unitinfo(game_state){
        this.signals.mouse_hover.clear()
        this.signals.mouse_hover.listen((xycoord)=>{
            var unit_info = clib.deep_copy(clib.at(game_state.map,xycoord))
            if(unit_info === "E"){
                unit_info = {
                    category: "E"
                }
            }
            unit_info.coord = xycoord
            this.signals.display_unit_info.fire(unit_info)
        })
    }
    highlight_move(final_instr){
        var major_coord = type_utils.major_coord(final_instr)
        var minor_coord = type_utils.minor_coord(final_instr)
        //console.log("major_coord")
        //console.log(major_coord)
        var draw_list = []
        if(major_coord){
            draw_list.push({
                coord: major_coord,
                color: "rgba(255,0,0,0.2)",
            })
        }
        if(minor_coord){
            draw_list.push({
                coord: minor_coord,
                color: "rgba(0,0,255,0.2)",
            })
        }

        this.signals.highlightCommand.fire({
            draw_list: draw_list,
            line_list: []
        })
    }
}
module.exports = {
    Analysis: Analysis,
}
