var basecomp = require("./base_component.js")
var signals = require("./global_signals.js")
var player_utils = require("../player_utils.js")
var make_change_script_popup = require("./change_script.js").make_change_script_popup

var BaseComponent = basecomp.BaseComponent
var createEl = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan

var Signal = signals.Signal

var edit_signal = new Signal()
var stop_edit_signal = new Signal()
signals.selectedData.listen(()=>signals.clear_highlights.fire())
edit_signal.listen(()=>signals.clear_highlights.fire())


class LibPannel extends BaseComponent {
    constructor(parent, basediv){
        super(parent, basediv)
        this.interface_div = createDiv({
            className: "lib_pannel_container",
        })
        basediv.appendChild(this.interface_div)
        this.stop_edit()
        this.handle_signals()
    }
    start_edit(){
        $(this.interface_div).empty()
        this.edit_lib_button = createDiv({
            innerText: "Edit Library",
            className: "lib_edit_button",
            parent: this.interface_div,
            onclick: () => {
                make_change_script_popup(signals.libData.getState(),Function,(js_code) => {
                    signals.libData.setState(js_code)
                })
            }
        })
        this.edit_lib_button = createDiv({
            innerText: "Edit Layout",
            className: "lib_edit_button",
            parent: this.interface_div,
            onclick: () => {
                make_change_script_popup(pretty_print(signals.layoutChanged.getState()),JSON.parse,(js_code) => {
                    signals.layoutChanged.setState(JSON.parse(js_code))
                })
            }
        })
        this.edit_button = createDiv({
            innerText: "Stop Edit",
            className: "lib_edit_button",
            parent: this.interface_div,
            onclick: () => {stop_edit_signal.fire()}
        })
    }
    stop_edit(){
        $(this.interface_div).empty()
        this.edit_button = createDiv({
            innerText: "Edit",
            className: "lib_edit_button",
            parent: this.interface_div,
            onclick: () => {edit_signal.fire()}
        })
    }
    handle_signals(){
        edit_signal.listen(() => {this.start_edit()})
        stop_edit_signal.listen(() => {this.stop_edit()})
    }
}
class ScriptInterface extends BaseComponent {
    constructor(parent, basediv){
        super(parent,basediv)
        this.mybuttonpannel = new PannelSelector(this,basediv)
        this.libbuttonpannel = new LibPannel(this,basediv)
        this.edit_overlay = new EditOverlay(this,basediv)
    }
}
class EditOverlay extends BaseComponent {
    constructor(parent, basediv){
        super(parent,basediv)
        this.overlay_div = createDiv({
            className: "game_overlay",
        })
        basediv.appendChild(this.overlay_div)
        $(this.overlay_div).hide()
        this.overlay_div.onclick = this.overlay_gone.bind(this)
        this.handle_signals()
    }
    handle_signals(){
        edit_signal.listen(() => {$(this.overlay_div).show()})
        stop_edit_signal.listen(() => {$(this.overlay_div).hide()})
    }
    overlay_gone(){
        stop_edit_signal.fire()
    }
}
function pretty_print(obj){
    return JSON.stringify(obj,null,2)
}
class PannelButton extends BaseComponent {
    constructor(parent, basediv, pannel_id, pannel_select_signal){
        super(parent, basediv)
        this.pannel_id = pannel_id
        this.button = createDiv({
            className: "pannel_button",
        })
        basediv.appendChild(this.button)
        this.button.onclick = (click)=>{
            pannel_select_signal.fire(this.pannel_id)
        }
        pannel_select_signal.listen((pan_id)=>{
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
        signals.layoutChanged.listen((layout_data)=>{
            this.pannel_selector = new Signal()
            $(this.parent_div).empty()
            this.selector_div = createDiv({
                parent: basediv,
                className: "pannel_selector_container",
                id: "selector_div"
            })
            var pannel_buttons = []
            for(var i = 0; i < layout_data.length; i++){
                console.log(layout_data[i])
                pannel_buttons.push(new PannelButton(this,this.selector_div,i,this.pannel_selector))
            }
            this.pannels = layout_data.map((pannel_data)=>new ScriptButtonPannel(this,this.selector_div,pannel_data,signals.selectedData))
            this.pannel_selector.listen((pannel_idx)=>{
                $(".pannel_holder").hide()
                var mypannel = this.pannels[pannel_idx]
                $(mypannel.interface_div).show()
                mypannel.pannel_select_data.fire(mypannel.mydata)
            })
            this.pannel_selector.fire(0)
        })
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
        this.mydata = this.buttons[0].state.data
        this.pannel_select_data.fire(this.buttons[0].state.data)
        this.pannel_select_data.listen((data)=>out_signal.setState(data))
        this.pannel_select_data.listen((newdata)=>{
            this.mydata = newdata
        })
    }
    deleteButtons(){
        $(this.interface_div).empty()
        this.buttons = []
    }
    makeButtonsFromData(init_data){
        var str_data = init_data.map(function(data){return{
            icon: data.icon,
            text: data.text,
            json_data: pretty_print(data.data),
        }})
        str_data.forEach((data) => {
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
        this.pannel_select_data.listen((data)=>{
            if(data === this.state.data){
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
            this.pannel_select_data.fire(this.state.data)
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
            className: "player_status_dot",
        })
        signals.activePlayer.listen(() => this.statusChanged(circ,player_id))
        signals.myPlayer.listen(() => this.statusChanged(circ,player_id))
        return circ
    }
    statusChanged(circ,player_id){
        var act_player = signals.activePlayer.getState()
        var myplayer = signals.myPlayer.getState()
        var newcolor = this.colorForState(player_id,myplayer,act_player)
        circ.style["background-color"] = newcolor
    }
    makePlayerRow(player_id){
        var player_box = createEl('tr',{
            children: [
                createEl('td',{
                    children: [this.createStatusCircle(player_id)]
                }),
                createEl('td',{
                    children: [createSpan({
                        innerText: player_id
                    })]
                }),
                createEl('td',{
                    children: [this.makeMoney(player_id)]
                })
            ]
        })
        return player_box
    }
    colorForState(this_id,my_id,active_id){
        if(this_id === my_id && this_id === active_id){
            return "green"
        }
        else if(this_id === my_id){
            return "blue"
        }
        else if(this_id === active_id){
            return "red"
        }
        else{
            return "white"
        }
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
