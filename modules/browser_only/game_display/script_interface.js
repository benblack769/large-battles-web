var basecomp = require("./base_component.js")
var Signal = require("../../logic_modules/signals.js").Signal

var BaseComponent = basecomp.BaseComponent
var createEl = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan


function init_script_signals(signals){
    signals.selectedData.listen(()=>signals.clear_highlights.fire())
    signals.analysis_signal.listen(()=>signals.clear_highlights.fire())
}
class ScriptInterface extends BaseComponent {
    constructor(parent, basediv,signals){
        super(parent,basediv,signals)
        this.analysis_button = new AnalysisButton(this,basediv,signals)
        //this.analysis_overlay = new AnalysisOverlay(this,basediv)
        this.mybuttonpannel = new PannelSelector(this,basediv,signals)
    }
}
function pretty_print(obj){
    return JSON.stringify(obj,null,2)
}
class AnalysisButton extends BaseComponent {
    constructor(parent, basediv,signals){
        super(parent, basediv,signals)
        init_script_signals(signals)
        this.interface_div = createDiv({
            className: "lib_pannel_container",
        })
        basediv.appendChild(this.interface_div)
        this.stop_edit()
        this.handle_signals()
    }
    start_edit(){
        $(this.interface_div).empty()
        this.edit_button = createDiv({
            innerText: "Stop Analysis",
            className: "lib_edit_button",
            parent: this.interface_div,
            onclick: () => {this.signals.stop_analysis_signal.fire()}
        })
    }
    stop_edit(){
        $(this.interface_div).empty()
        this.edit_button = createDiv({
            innerText: "Start analysis",
            className: "lib_edit_button",
            parent: this.interface_div,
            onclick: () => {this.signals.analysis_signal.fire()}
        })
    }
    handle_signals(){
        this.signals.analysis_signal.listen(() => {this.start_edit()})
        this.signals.stop_analysis_signal.listen(() => {this.stop_edit()})
    }
}
class PannelButton extends BaseComponent {
    constructor(parent, basediv, pannel_id,signals){
        super(parent, basediv,signals)
        this.pannel_id = pannel_id
        this.button = createDiv({
            className: "pannel_button",
        })
        basediv.appendChild(this.button)
        this.button.onclick = (click)=>{
            this.signals.pannelSelector.fire(this.pannel_id)
        }
        this.signals.pannelSelector.listen((pan_id)=>{
            if(pan_id === this.pannel_id){
                this.button.style["background-color"] = "#bbbbbb"
            }
            else{
                this.button.style["background-color"] = "#ffffff"
            }
        })
    }
}
class PannelSelector extends BaseComponent {
    constructor(parent, basediv,signals){
        super(parent, basediv,signals)

        this.pannels = []
        var layout_data = JSON.parse(document.getElementById("default_layout_src").innerHTML)
        $(this.parent_div).empty()
        this.selector_div = createDiv({
            parent: basediv,
            className: "pannel_selector_container",
            //id: "selector_div"
        })
        var pannel_buttons = []
        for(var i = 0; i < layout_data.length; i++){
            //console.log(layout_data[i])
            pannel_buttons.push(new PannelButton(this,this.selector_div,i,signals))
        }
        var base_signal = this.signals.selectedData
        this.pannels = layout_data.map((pannel_data)=>new ScriptButtonPannel(this,this.selector_div,pannel_data,base_signal,signals))
        this.signals.pannelSelector.listen((pannel_idx)=>{
            this.pannels.forEach(function(pannel){
                $(pannel.interface_div).hide()
            })
            var mypannel = this.pannels[pannel_idx]
            $(mypannel.interface_div).show()
            mypannel.pannel_select_data.fire(mypannel.selected_id)
        })
        this.signals.pannelSelector.fire(0)
        this.handleAnalysisRemoval()
    }
    handleAnalysisRemoval(){
        this.signals.analysis_signal.listen(()=>{
            $(this.selector_div).hide()
        })
        this.signals.stop_analysis_signal.listen(()=>{
            $(this.selector_div).show()
        })
    }
}
class ScriptButtonPannel extends BaseComponent {
    constructor(parent, basediv, pannel_data, out_signal ,signals){
        super(parent, basediv,signals)
        this.interface_div = createDiv({
            className: "pannel_holder"
            //className: "script_container",
        })
        basediv.appendChild(this.interface_div)

        this.pannel_select_data = new Signal()
        this.buttons = []
        this.makeButtonsFromData(pannel_data)
        this.selected_id = pannel_data[0].id
        this.pannel_select_data.fire(this.selected_id)
        this.pannel_select_data.listen((id)=>out_signal.setState(id))
        this.pannel_select_data.listen((id)=>{
            this.selected_id = id
        })
    }
    makeButtonsFromData(init_data){
        init_data.forEach((data) => {
            this.buttons.push(new ScriptButton(this, this.interface_div, data, this.pannel_select_data,this.signals))
        })
    }
}
class ScriptButton extends BaseComponent {
    constructor(parent, basediv, init_data, pannel_select_data,signals){
        super(parent, basediv,signals)
        this.pannel_select_data = pannel_select_data
        this.state = {
            data: init_data,
            selected: false,
            editing: false,
        }
        this.mydiv = this.render()
        basediv.appendChild(this.mydiv)
        this.handle_signals()
    }
    handle_signals(){
        this.pannel_select_data.listen((id)=>{
            if(id === this.state.data.id){
                this.state.selected = true;
                this.mydiv.classList.add("game_script_box_selected")
            }
            else{
                this.deselectScript()
            }
        })
    }
    deselectScript(){
        if(this.state.selected){
            this.state.selected = false;
            this.mydiv.classList.remove("game_script_box_selected")
        }
    }
    selectScript(){
        if(!this.state.selected){
            this.pannel_select_data.fire(this.state.data.id)
        }
        //this.changeState(Object.assign({selected:true},this.state))
    }
    render(){
        var el = createDiv({
            className: "game_script_box",
        })
        var icon = this.state.data.icon
        if(icon){
            var background_src = document.getElementById(icon)
            if(background_src && background_src.src){
                el.style["background-image"] = 'url('+background_src.src+")"
            }
        }
        var text = this.state.data.text
        if(text){
            el.innerText = text
        }
        el.onclick = this.selectScript.bind(this)
        return el;
    }
}
class PlayerTableInfo extends BaseComponent {
    constructor(parent, basediv, player_ids,signals){
        super(parent, basediv,signals)
        var player_rows = player_ids.map(this.makePlayerRow.bind(this))
        this.table_div = createEl('tbody',{})
        player_rows.forEach((row)=>this.table_div.appendChild(row))
        this.main_table = createEl('table',{
            className: "player_info_table",
            parent: basediv,
            children: [
                createEl('thead',{
                    children: [
                        createEl('tr',{
                            children:[
                                createEl('th',{
                                    innerText: "Active",
                                }),
                                createEl('th',{
                                    innerText: "Color",
                                }),
                                createEl('th',{
                                    innerText: "Money",
                                }),
                                createEl('th',{
                                    innerText: "Player",
                                }),
                            ]
                        })
                    ]
                }),
                this.table_div
            ]
        })
    }
    createStatusCircle(player_id){
        var circ = createSpan({
            className: "player_active_star",
        })
        this.signals.activePlayer.listen(() => this.statusChanged(circ,player_id))
        this.signals.myPlayer.listen(() => this.statusChanged(circ,player_id))
        return circ
    }
    statusChanged(circ,player_id){
        var act_player = this.signals.activePlayer.getState()

        circ.innerHTML = (player_id === act_player) ? "☼" : "☽"
    }
    makePlayerRow(player_id){
        var player_box = createEl('tr',{
            children: [
                createEl('td',{
                    children: [this.createStatusCircle(player_id)]
                }),
                createEl('td',{
                    children: [
                        createSpan({
                            className: "player_status_dot",
                            style: {
                                "background-color": this.signals.playerColors.getState()[player_id]
                            }
                        })
                    ]
                }),
                createEl('td',{
                    children: [this.makeMoney(player_id)]
                }),
                createEl('td',{
                    children: [createSpan({
                        innerText: player_id
                    })]
                }),
            ]
        })
        return player_box
    }
    makeMoney(player_id){
        var money = createSpan({})
        this.signals.gameStateChange.listen(instr=>{
            if(instr.type === "SET_MONEY" && instr.player === player_id){
                money.innerText = instr.amount
            }
        })
        return money
    }
}
class EndTurnButton extends BaseComponent {
    constructor(parent, basediv,signals){
        super(parent, basediv,signals)

        this.end_turn_button = createDiv({
            className: "player_info_button",
            innerHTML: "End Turn",
            parent: basediv,
        })
        this.createEndTurnButton()
    }
    createEndTurnButton(){
        var $end_button = $(this.end_turn_button)
        $end_button.click(()=>{
            this.signals.ended_turn.fire()
        })
        var status_changed = ()=>{
            if(this.signals.activePlayer.getState() === this.signals.myPlayer.getState()){
                $end_button.show()
            }
            else{
                $end_button.hide()
            }
        }
        this.signals.activePlayer.listen(status_changed)
        this.signals.myPlayer.listen(status_changed)
    }
}
class AnalysisNavigation extends BaseComponent {
    constructor(parent, basediv, signals){
        super(parent, basediv,signals)
        this.fast_forward = createSpan({
            innerHTML:"⏩",
            onclick: this.navsignal("FAST_FORWARD"),
        })
        this.forward = createSpan({
            innerHTML:"▶️",
            onclick: this.navsignal("FORWARD"),
        })
        this.fast_backward = createSpan({
            innerHTML:"⏪",
            onclick: this.navsignal("FAST_BACKWARD"),
        })
        this.backward = createSpan({
            innerHTML:"◀️",
            onclick: this.navsignal("BACKWARD"),
        })
        this.analysis_container = createDiv({
            parent: basediv,
            children: [
                this.fast_backward,
                this.backward,
                this.forward,
                this.fast_forward,
            ]
        })
    }
    navsignal(message){
        var sigs = this.signals;
        return ()=>{
            sigs.analysis_navigation.fire(message)
        }
    }
}
class PlayerInfoPannel extends BaseComponent {
    constructor(parent, basediv, player_ids,signals){
        super(parent, basediv,signals)

        this.main_table_div = createDiv({
            className: "player_info_bar",
            parent: basediv,
        })
        this.pinfo_table = new PlayerTableInfo(this,this.main_table_div,player_ids,signals)
        this.end_turn_container = createDiv({
            parent: this.main_table_div,
            style: {
                width: "100%"
            },
        })
        this.end_turn_button = new EndTurnButton(this,this.end_turn_container,signals)
        this.analysis_nav_container = createDiv({
            parent: this.main_table_div,
            style: {
                width: "100%"
            },
        })
        this.analysis_nav = new AnalysisNavigation(this,this.analysis_nav_container,signals)
        $(this.analysis_nav_container).hide()
        this.set_signals()
    }
    set_signals(){
        this.signals.analysis_signal.listen(()=>{
            $(this.end_turn_container).hide()
            $(this.analysis_nav_container).show()
        })
        this.signals.stop_analysis_signal.listen(()=>{
            $(this.end_turn_container).show()
            $(this.analysis_nav_container).hide()
        })
    }
}
class UnitInfoPannel extends BaseComponent {
    constructor(parent, basediv, signals){
        super(parent, basediv,signals)

        this.main_div = createDiv({
            className: "unitinfo_box",
            parent: basediv,
        })
        signals.display_unit_info.listen((unit_info)=>{
            var display_str = JSON.stringify(unit_info,null,2)
            this.main_div.innerText = display_str
        })
    }
}
class AIRecomendations extends BaseComponent {
    constructor(parent, basediv, signals){
        super(parent, basediv,signals)

        this.main_div = createDiv({
            className: "ai_recomendations",
            parent: basediv,
            children: [
                createSpan({
                    innerText: "AI recomendation: "
                }),
                createEl('button',{
                    innerText: "Follow",
                    onclick: function(){signals.follow_ai_move.fire()},
                }),
                createEl('button',{
                    innerText: "Sample",
                    onclick: function(){signals.ai_start_recomendation.fire()},
                }),
                createEl('button',{
                    innerText: "MMDisplay",
                    onclick: function(){signals.ai_start_major_move_display.fire()},
                }),
            ]
        })
    }
}
module.exports = {
    ScriptInterface: ScriptInterface,
    PlayerInfoPannel: PlayerInfoPannel,
    AIRecomendations: AIRecomendations,
    UnitInfoPannel: UnitInfoPannel,
    AnalysisButton: AnalysisButton,
}
