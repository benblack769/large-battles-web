var display_board = require("../display_board.js")
var basecomp = require("./base_component.js")
var BaseComponent = basecomp.BaseComponent
var createEL = basecomp.createEL
var createDiv = basecomp.createDiv
var createSpan = basecomp.createSpan

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
        this.super_parent_div = createDiv({
            style: {
                position: "absolute",
                top: "80px",
                left: "80px",
                right: "-10px",
                bottom: "-10px",
                width: sizes.xsize+300+"px",
                height: sizes.ysize+300+"px",
            }
        })
        this.parent_div = createDiv({
            style: {
                position:"absolute",
                width:sizes.xsize+"px",
                height:sizes.ysize+"px",
                top:-50,
                left:-50,
                "z-index": "1",
                overflow: "hidden",
            }
        })
        basediv.appendChild(this.super_parent_div)
        this.super_parent_div.appendChild(this.parent_div)
        this.background_canvas = new BackgroundCanvas(this,canvas_overlay_div(this.parent_div),gamesize)
        this.foreground_canvas = new ForegroundCanvas(this,canvas_overlay_div(this.parent_div),gamesize)
        this.click_interface_canvas = new ClickInterfaceCanvas(this,canvas_overlay_div(this.parent_div),gamesize)
    }
}
module.exports = {
    GameBoard: GameBoard,
}
