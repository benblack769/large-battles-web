var basecomp = require("./base_component.js")
var BaseComponent = basecomp.BaseComponent
var createEL = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan

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
            onclick: () => {this.sendMessageUp({type:"STOP_EDIT_MODE"})}
        })
    }
    stop_edit(){
        $(this.interface_div).empty()
        this.edit_button = createDiv({
            innerText: "Edit",
            className: "lib_edit_button",
            parent: this.interface_div,
            onclick: () => {this.sendMessageUp({type:"EDIT_MODE"})}
        })
    }
    messageDown(message){
        switch(message.type){
            case "EDIT_MODE": this.start_edit(); break;
            case "STOP_EDIT_MODE": this.stop_edit(); break;
        }
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
    messageUp(message){
        switch(message.type){
            case "EDIT_MODE": this.messageChildren(message); break;
            case "STOP_EDIT_MODE": this.messageChildren(message); break;
        }
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
    }
    messageDown(message){
        console.log(message)
        switch(message.type){
            case "EDIT_MODE": $(this.overlay_div).show(); break;
            case "STOP_EDIT_MODE": $(this.overlay_div).hide(); break;
        }
    }
    overlay_gone(){
        this.sendMessageUp({type:"STOP_EDIT_MODE"})
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
    messageUp(message){
        switch(message.type){
            case "SCRIPT_BUTTON_SELECTED": this.messageChildren(message); break;
            case "ADD_CELL": break;
            case "CELL_SELECTED": break;
            default: console.log(message); break;
        }
    }
    children(){
        return this.buttons
    }
    messageDown(message){
        switch(message.type){
            case "EDIT_MODE": this.messageChildren(message); break;
            case "STOP_EDIT_MODE": this.messageChildren(message); break;
        }
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
        this.basediv.appendChild(this.mydiv)
    }
    messageDown(message){
        switch(message.type){
            case "EDIT_MODE": this.state.editing = true; this.changedState(); break;
            case "STOP_EDIT_MODE": this.state.editing = false; this.changedState(); break;
            case "SCRIPT_BUTTON_SELECTED": this.deselectScript(); break;
        }
    }
    deselectScript(){
        if(this.state.selected){
            this.state.selected = false;
            this.changedState()
        }
    }
    selectScript(){
        if(!this.state.selected){
            this.sendMessageUp({
                type: "SCRIPT_BUTTON_SELECTED",
                data: this.state.data,
            })
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
