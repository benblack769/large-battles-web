

function switch_to_single_player(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
}

function createEL(name,methods){
    var el = document.createElement(name)
    if(methods.children){
        methods.children.forEach(function(child){
            el.appendChild(child)
        })
        delete methods.children
    }
    for(key in methods){
        el[key] = methods[key]
    }
    return el;
}
function createDiv(methods){
    return createEL("div", methods)
}
function createSpan(methods){
    return createEL("span", methods)
}
function make_change_script_popup(current_value, verifier, callback){
    $("#global_text_popup").show()
    $("#text_edit_textarea").val(current_value)
    $("#text_edit_error_textarea").val("")

    $("#text_edit_ok_button").click(function(){
        $("#text_edit_error_textarea").val("")
        try{
            var value = $("#text_edit_textarea").val();
            var parsed_val = verifier(value)
            callback(parsed_val)
            $("#global_text_popup").hide()
        }
        catch(e){
            $("#text_edit_error_textarea").val("ERROR: "+e.message)
        }
    })
    $("#text_edit_cancel_button").click(function(){
        $("#global_text_popup").hide()
    })
}
class BaseComponent {
    constructor(parent, basediv){
        this.__parent = parent;
        this.basediv = basediv;
    }
    messageChildren(message){
        this.children().forEach(function(child){
            child.messageDown(message)
        })
    }
    sendMessageUp(message){
        this.__parent.messageUp(message)
    }
    messageDown(message){
        //no-op
    }
    children(){
        return []
    }
}
class ScriptInterface extends BaseComponent {
    constructor(parent, basediv){
        super(parent,basediv)
        this.mybuttonpannel = new ScriptButtonPannel(this,basediv)
        this.edit_overlay = new EditOverlay(this,basediv)
    }
    children(){
        return [this.mybuttonpannel, this.edit_overlay]
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
        $(this.overlay_div).hide()
        this.overlay_div.onclick = this.overlay_gone.bind(this)
    }
    messageDown(message){
        switch(message.type){
            case "EDIT_MODE": $(this.overlay_div).show(); break;
            case "STOP_EDIT_MODE": $(this.overlay_div).hide(); break;
        }
    }
    overlay_gone(){
        this.sendMessageUp("STOP_EDIT_MODE")
    }
}
class ScriptButtonPannel extends BaseComponent {
    constructor(parent, basediv){
        super(parent, basediv)
        this.buttons = [
            new ScriptButton(this,basediv),
            new ScriptButton(this,basediv),
        ]
    }
    messageUp(message){
        switch(message.type){
            case "EDIT_MODE": this.messageUp(message); break;
            case "STOP_EDIT_MODE": this.messageUp(message); break;
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
            case "EDIT_MODE": this.messageDown(message); break;
            case "STOP_EDIT_MODE": this.messageDown(message); break;
        }
    }
}
class ScriptButton extends BaseComponent {
    constructor(parent, basediv){
        super(parent, basediv)

        this.state = {
            data: {},
            selected: false,
            editing: true,
        }
        this.mydiv = this.render()
        this.basediv.appendChild(this.mydiv)
    }
    selectScript(){
        console.log("selected")
        this.state.selected = true;
        this.changedState()
        //this.changeState(Object.assign({selected:true},this.state))
    }
    changedState(){
        this.basediv.replaceChild(this.render(),this.mydiv)
    }
    render(){
        var myChildren = !this.state.editing ? [] :  [
            createSpan({
                className: "script_box_button script_box_edit_button",
                innerText: "Edit",
            }),
            createSpan({
                innerText:"   ",
            }),
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

function init_single_player(){
    var basediv = document.getElementById("single_page_game_overlay")
    var base = new ScriptInterface(null,basediv)

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
