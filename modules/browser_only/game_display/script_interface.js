var basecomp = require("./base_component.js")
var signals = require("./global_signals.js")

var BaseComponent = basecomp.BaseComponent
var createEL = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan

var Signal = signals.Signal

var edit_signal = new Signal()
var stop_edit_signal = new Signal()
var script_selected = new Signal()
script_selected.listen(()=>signals.clear_clicks.fire())

class LibPannel extends BaseComponent {
    constructor(parent, basediv){
        super(parent, basediv)
        this.interface_div = createDiv({
            className: "lib_pannel_container",
        })
        basediv.appendChild(this.interface_div)
        this.state = {
            js_lib: "",
        }
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
                make_change_script_popup(this.state.js_lib,Function,(js_code) => {
                    this.state.js_lib = js_code
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
        this.mybuttonpannel = new ScriptButtonPannel(this,basediv)
        this.libbuttonpannel = new LibPannel(this,basediv)
        this.edit_overlay = new EditOverlay(this,basediv)
    }
    children(){
        return [this.mybuttonpannel,this.libbuttonpannel,this.edit_overlay]
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
class ScriptButtonPannel extends BaseComponent {
    constructor(parent, basediv){
        super(parent, basediv)
        this.interface_div = createDiv({
            className: "script_container",
        })
        basediv.appendChild(this.interface_div)
        this.buttons = [
            new ScriptButton(this,this.interface_div),
            new ScriptButton(this,this.interface_div),
        ]
    }
    children(){
        return this.buttons
    }
}
class ScriptButton extends BaseComponent {
    constructor(parent, basediv){
        super(parent, basediv)

        this.state = {
            data: "",
            selected: false,
            editing: false,
        }
        this.mydiv = this.render()
        basediv.appendChild(this.mydiv)
        this.handle_signals()
    }
    handle_signals(){
        edit_signal.listen(() => {
            this.state.editing = true;
            this.changedState();
        })
        stop_edit_signal.listen(() => {
            this.state.editing = false;
            this.changedState();
        })
        script_selected.listen(() => {
            this.deselectScript();
        })
    }
    deselectScript(){
        if(this.state.selected){
            this.state.selected = false;
            this.changedState()
        }
    }
    selectScript(){
        if(!this.state.selected){
            script_selected.fire(this.state.data)
            this.state.selected = true;
            this.changedState()
        }
        //this.changeState(Object.assign({selected:true},this.state))
    }
    changedState(){
        var newmydiv = this.render()
        this.basediv.replaceChild(newmydiv,this.mydiv)
        this.mydiv = newmydiv
    }
    data_edited(new_data){
        this.state.data = new_data
    }
    render(){
        var myself = this
        var myChildren = !this.state.editing ? [] :  [
            createSpan({
                className: "script_box_button script_box_edit_button",
                innerText: "Edit",
                onclick: (function(){
                    make_change_script_popup(myself.data,Function,function(js_code){
                        myself.data = js_code
                    })
                })
            }),
            document.createTextNode(" "),
            createSpan({
                className: "script_box_button script_box_delete_button",
                innerText: "Delete",
            })
        ]
        var el = createDiv({
            className: "game_script_box",
            onclick: this.selectScript.bind(this),
            children: myChildren,
        })
        if(this.state.selected){
            el.classList.add("game_script_box_selected")
        }
        return el;
    }
}
module.exports = {
    ScriptInterface: ScriptInterface,
}
