var basecomp = require("./base_component.js")
var signals = require("./global_signals.js")

var BaseComponent = basecomp.BaseComponent
var createEl = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan

var Signal = signals.Signal

var edit_signal = new Signal()
var stop_edit_signal = new Signal()
function init_script_signals(){
    edit_signal = new Signal()
    stop_edit_signal = new Signal()

    signals.selectedData.listen(()=>signals.clear_highlights.fire())
    edit_signal.listen(()=>signals.clear_highlights.fire())
}
class ScriptInterface extends BaseComponent {
    constructor(parent, basediv){
        super(parent,basediv)
        this.mybuttonpannel = new PannelSelector(this,basediv)
    }
}
function pretty_print(obj){
    return JSON.stringify(obj,null,2)
}
class PannelButton extends BaseComponent {
    constructor(parent, basediv, pannel_id){
        super(parent, basediv)
        this.pannel_id = pannel_id
        this.button = createDiv({
            className: "pannel_button",
        })
        basediv.appendChild(this.button)
        this.button.onclick = (click)=>{
            signals.pannelSelector.fire(this.pannel_id)
        }
        signals.pannelSelector.listen((pan_id)=>{
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
    constructor(parent, basediv){
        super(parent, basediv)

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
            pannel_buttons.push(new PannelButton(this,this.selector_div,i))
        }
        var base_signal = signals.selectedData
        this.pannels = layout_data.map((pannel_data)=>new ScriptButtonPannel(this,this.selector_div,pannel_data,base_signal))
        signals.pannelSelector.listen((pannel_idx)=>{
            $(".pannel_holder").hide()
            var mypannel = this.pannels[pannel_idx]
            $(mypannel.interface_div).show()
            mypannel.pannel_select_data.fire(mypannel.selected_id)
        })
        signals.pannelSelector.fire(0)
    }
}
class ScriptButtonPannel extends BaseComponent {
    constructor(parent, basediv, pannel_data, out_signal){
        super(parent, basediv)
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
            this.buttons.push(new ScriptButton(this, this.interface_div, data, this.pannel_select_data))
        })
    }
}
class ScriptButton extends BaseComponent {
    constructor(parent, basediv, init_data, pannel_select_data){
        super(parent, basediv)
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
class PlayerInfoPannel extends BaseComponent {
    constructor(parent, basediv, player_ids){
        super(parent, basediv)
        var player_rows = player_ids.map(this.makePlayerRow.bind(this))
        this.table_div = document.getElementById("player_info_tbody")
        this.table_div.innerHTML = ''
        player_rows.forEach((row)=>this.table_div.appendChild(row))
        this.createEndTurnButton()
    }
    createEndTurnButton(){
        $("#end_turn_button").click(function(){
            signals.ended_turn.fire()
        })
        function status_changed(){
            if(signals.activePlayer.getState() === signals.myPlayer.getState()){
                $("#end_turn_button").show()
            }
            else{
                $("#end_turn_button").hide()
            }
        }
        signals.activePlayer.listen(status_changed)
        signals.myPlayer.listen(status_changed)
    }
    createStatusCircle(player_id){
        var circ = createSpan({
            className: "player_active_star",
        })
        signals.activePlayer.listen(() => this.statusChanged(circ,player_id))
        signals.myPlayer.listen(() => this.statusChanged(circ,player_id))
        return circ
    }
    statusChanged(circ,player_id){
        var act_player = signals.activePlayer.getState()

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
                                "background-color": signals.playerColors.getState()[player_id]
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
        signals.gameStateChange.listen(instr=>{
            if(instr.type === "SET_MONEY" && instr.player === player_id){
                money.innerText = instr.amount
            }
        })
        return money
    }
}
module.exports = {
    ScriptInterface: ScriptInterface,
    PlayerInfoPannel: PlayerInfoPannel,
}
