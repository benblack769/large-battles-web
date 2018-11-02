var display_board = require("./display_board.js")
var load_images = require("./load_images.js")
var game_types = require("../logic_modules/types.js")

function switch_to_single_player(){
    console.log("switched to single player")
    $(".page_level").hide()
    $("#single_player_page").show()
}

function createEL(name,methods){
    var el = document.createElement(name)
    if(methods.style){
        for(var key in methods.style){
            el.style[key] = methods.style[key]
        }
        delete methods.style
    }
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
        this.interface_div = createDiv({
            className: "script_container",
        })
        basediv.appendChild(this.interface_div)
        this.mybuttonpannel = new ScriptButtonPannel(this,this.interface_div)
        this.edit_overlay = new EditOverlay(this,this.interface_div)
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
            data: {},
            selected: false,
            editing: true,
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
    render(){
        var myChildren = !this.state.editing ? [] :  [
            createSpan({
                className: "script_box_button script_box_edit_button",
                innerText: "Edit",
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
function getxy_from_click(event){
    return {
        x: event.offsetX,
        y: event.offsetY,
    }
}
function create_canvas_of_size(gamesize){
    var sizes = display_board.get_game_pixel_size(gamesize.xsize,gamesize.ysize)
    var canvas = createEL("canvas",{
        width: sizes.xsize,
        height: sizes.ysize,
    })
    return canvas
}
class BackgroundCanvas extends BaseComponent {
    constructor(parent,basediv, gamesize){
        super(parent,basediv)
        this.canvas = create_canvas_of_size(gamesize)
        this.context = this.canvas.getContext('2d')
        display_board.draw_background(this.context,gamesize.xsize,gamesize.ysize)
        basediv.appendChild(this.canvas)
    }
}
class ForegroundCanvas extends BaseComponent {
    constructor(parent,basediv,gamesize){
        super(parent,basediv)
        this.canvas = create_canvas_of_size(gamesize)
        this.context = this.canvas.getContext('2d')
        basediv.appendChild(this.canvas)
    }
}
class ClickInterfaceCanvas extends BaseComponent {
    constructor(parent, basediv, gamesize){
        super(parent,basediv)
        this.canvas = create_canvas_of_size(gamesize)
        this.context = this.canvas.getContext('2d')
        basediv.appendChild(this.canvas)
        display_board.draw_rect(this.context, {x:5,y:6}, "rgba(255,0,0,0.4)", "rgba(255,0,0,0.8)")
        this.canvas.onclick = this.handleClick.bind(this)
    }
    handleClick(clickevent){
        var xyloc = getxy_from_click(clickevent)
        var xycoord = display_board.get_game_coords_from_pixels(xyloc.x,xyloc.y)
        display_board.draw_rect(this.context, xycoord, "rgba(255,0,0,0.4)", "rgba(255,0,0,0.8)")
    }
}
function canvas_overlay_div(basediv){
    var el = createDiv({
        className: "canvas_holder",
    })
    basediv.appendChild(el)
    return el
}
function canvas_container_div(){
    return createDiv({

    })
}
class GameBoard extends BaseComponent {
    constructor(parent, basediv, gamesize){
        super(parent,basediv)
        this.gamesize = gamesize
        this.x_pos = 0
        this.y_pos = 0
        var sizes = display_board.get_game_pixel_size(gamesize.xsize,gamesize.ysize)
        this.parent_div = createDiv({
            style: {
                position:"fixed",
                width:sizes.xsize+"px",
                height:sizes.ysize+"px",
                top:0+"px",
                left:0+"px",
                "z-index": "1",
            }
        })
        this.handleScreenShift({x:0,y:0})
        basediv.appendChild(this.parent_div)
        this.background_canvas = new BackgroundCanvas(this,canvas_overlay_div(this.parent_div),gamesize)
        this.foreground_canvas = new ForegroundCanvas(this,canvas_overlay_div(this.parent_div),gamesize)
        this.click_interface_canvas = new ClickInterfaceCanvas(this,canvas_overlay_div(this.parent_div),gamesize)
        this.handle_arrowkeys()
    }
    handle_arrowkeys(){
        document.addEventListener('keydown', (function(e) {
            var shift_amt = {
                x: 0,
                y: 0,
            }
            switch (e.keyCode) {
                case 37:
                    //left key
                    shift_amt.x -= 1;
                    break;
                case 38:
                    //up key
                    shift_amt.y += 1;
                    break;
                case 39:
                    //right key
                    shift_amt.x += 1;
                    break;
                case 40:
                    //down key
                    shift_amt.y -= 1;
                    break;
            }
            this.handleScreenShift(shift_amt)
        }).bind(this));
    }
    handleScreenShift(shift){
        this.x_pos = Math.max(-3,Math.min(this.gamesize.xsize+1,this.x_pos+shift.x))
        this.y_pos = Math.max(-2,Math.min(this.gamesize.ysize+1,this.y_pos-shift.y))
        var game_pix = display_board.game_position_to_pix(this.x_pos,this.y_pos)
        this.parent_div.style.top = game_pix.y+"px";
        this.parent_div.style.left = game_pix.x+"px";
        console.log(game_pix)
    }
}
class GameInterface extends BaseComponent {
    constructor(parent,basediv,gamesize){
        super(parent,basediv)
        this.gameboard = new GameBoard(this,basediv,gamesize)
        this.script_inter = new ScriptInterface(this,(basediv))
    }
    children(){
        return [this.gameboard, this.script_inter]
    }

}

function init_single_player(){
    var basediv = document.getElementById("single_page_game_overlay")
    var gamesize = {
        xsize: 90,
        ysize: 60,
    }
    load_images.on_load_all_images(game_types.get_all_sources(),function(){
        var base = new GameInterface(null, basediv, gamesize)
    })
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
