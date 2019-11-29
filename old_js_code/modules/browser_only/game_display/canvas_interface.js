var display_board = require("../display_board.js")
var basecomp = require("./base_component.js")
var icons = require("../../logic_modules/types.js").icons
var base_ops = require("../../logic_modules/base_ops.js")

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
    constructor(parent,basediv,gamesize,signals){
        super(parent,basediv,signals)
        this.canvas = create_canvas_of_size(gamesize)
        this.context = this.canvas.getContext('2d')
        basediv.appendChild(this.canvas)
        this.cur_map = null
        this.signals.game_state_changed.listen((game_state) => {
            this.redraw(game_state)
        })
    }
    redraw(game_state){
         //this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
         base_ops.all_coords(game_state).forEach((coord) => {
             if(!this.cur_map || !base_ops.deep_equals(base_ops.at(this.cur_map,coord),base_ops.at(game_state.map,coord))){
                 this.onCoordChange(base_ops.at(game_state.map,coord), coord, game_state)
             }
         })
         this.cur_map = base_ops.deep_copy(game_state.map)
    }
    onCoordChange(unit_data, coord, gane_state){
        //display_board.clear_rect(this.context,coord)
        this.drawUnit(unit_data, coord, gane_state.stats)
    }
    drawUnit(data, coord, stats){
        display_board.clear_rect(this.context,coord)
        if(data.category != "unit") {
            return
        }
        console.log("drawn")
        display_board.draw_image(this.context,icons.unit_icons[data.unit_type],coord)
        var player_color = this.signals.playerColors.getState()[data.player]
        display_board.draw_player_marker(this.context,coord,player_color)
        this.createChange(data, coord)
        if(data.status.turns_til_active > 0){
            var max_turns_til_active = stats.unit_types[data.unit_type].activation_delay
            var percent_done = data.status.turns_til_active / max_turns_til_active
            display_board.draw_timer(this.context, coord, percent_done, "rgba(0,0,0,0.4)", "rgba(0,0,0,0.1)")
        }
    }
    createChange(data, coord){
        display_board.draw_image(this.context,icons.unit_icons[data.unit_type],coord)
        var player_color = this.signals.playerColors.getState()[data.player]
        display_board.draw_player_marker(this.context,coord,player_color)
    }
}
class Color {
    constructor(r,g,b){
        this.r = r;
        this.g = g;
        this.b = b;
    }
    toString(alpha){
        if(alpha){
            return "rgba("+this.r+","+this.g+","+this.b+","+alpha+")";
        }else{
            return "rgb("+this.r+","+this.g+","+this.b+")";
        }
    }
}
function event_to_coord(event){
    var xyloc = getxy_from_click(event)
    var xycoord = display_board.get_game_coords_from_pixels(xyloc.x,xyloc.y)
    return xycoord;
}
function deep_equals(obj1,obj2){
    return JSON.stringify(obj1) === JSON.stringify(obj2)
}
class ClickInterfaceCanvas extends BaseComponent {
    constructor(parent, basediv, gamesize,signals){
        super(parent,basediv,signals)
        this.canvas = create_canvas_of_size(gamesize)
        this.context = this.canvas.getContext('2d')
        basediv.appendChild(this.canvas)
        this.canvas.onclick = (event) => {
            this.signals.clickOccurred.fire(event_to_coord(event))
        }
        this.hover_coord = null
        this.canvas.onmousemove = (event) => {
            this.handleMove(event)
        }
        this.canvas.onmouseout = () => {
            this.clearHover()
        }
    }
    handleMove(moveevent){
        var xycoord = event_to_coord(moveevent)
        if(!deep_equals(xycoord,this.hover_coord)){
            this.clearHover()
            this.hover_coord = xycoord
            display_board.stroke_rect(this.context, xycoord, "black")
            this.signals.mouse_hover.fire(xycoord)
        }
    }
    clearHover(){
        if(this.hover_coord){
            display_board.clear_rect(this.context,this.hover_coord)
            this.hover_coord = null
        }
    }
}
var analysis_radius = 3;
class AnalysisCanvas extends BaseComponent {
    constructor(parent, basediv, gamesize,signals){
        super(parent,basediv,signals)
        this.canvas = create_canvas_of_size(gamesize)
        this.context = this.canvas.getContext('2d')
        basediv.appendChild(this.canvas)
        this.canvas.onclick = (event) => {
            this.signals.analysisClickOccurred.fire(event_to_coord(event))
        }
        this.hover_coord = null
        this.canvas.onmousemove = (event) => {
            this.handleMove(event)
        }
        this.canvas.onmouseout = () => {
            this.clearHover()
        }
    }
    handleMove(moveevent){
        var xycoord = event_to_coord(moveevent)
        if(!deep_equals(xycoord,this.hover_coord)){
            this.clearHover()
            this.hover_coord = xycoord
            var color = "rgba(0,0,0,0.2)"
            display_board.fill_center_rect(this.context, xycoord, color, analysis_radius)
            display_board.fill_rect(this.context, xycoord, color)
        }
    }
    clearHover(){
        if(this.hover_coord){
            display_board.clear_center_rect(this.context,this.hover_coord,analysis_radius)
            this.hover_coord = null
        }
    }
}
function canvas_overlay_div(basediv){
    var el = createDiv({
        className: "canvas_holder",
    })
    basediv.appendChild(el)
    return el
}
class HighlightCanvas extends BaseComponent {
    constructor(parent,basediv, gamesize,signals){
        super(parent,basediv,signals)
        this.canvas = create_canvas_of_size(gamesize)
        this.context = this.canvas.getContext('2d')
        basediv.appendChild(this.canvas)
        this.signals.highlightCommand.listen(this.onHighlightCommand.bind(this))
        this.signals.clear_highlights.listen(this.clear.bind(this))
    }
    clear(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    onHighlightCommand(command){
        this.clear()
        command.draw_list.forEach((command)=>{
            display_board.fill_rect(this.context, command.coord, command.color)
        })
        command.line_list.forEach((command)=>{
            display_board.draw_line(this.context,command.coord1,command.coord2)
        })
    }
}
class GameBoard extends BaseComponent {
    constructor(parent, basediv, gamesize,signals){
        super(parent,basediv,signals)
        this.gamesize = gamesize
        this.x_pos = 0
        this.y_pos = 0
        var sizes = display_board.get_game_pixel_size(gamesize.xsize,gamesize.ysize)
        this.main_base_div = createDiv({
            parent: basediv,
            className: "canvas_scroll_background",
        })
        //takes up space, forcing div to scroll
        this.spacing_el = createEL("div",{
            parent: this.main_base_div,
            style: {
                width: sizes.xsize+300+"px",
                height: sizes.ysize+300+"px",
            }
        })
        this.parent_div = this.main_base_div
        this.background_canvas = new BackgroundCanvas(this,canvas_overlay_div(this.parent_div),gamesize,signals)
        this.foreground_canvas = new ForegroundCanvas(this,canvas_overlay_div(this.parent_div),gamesize,signals)
        this.highlight_canvas = new HighlightCanvas(this,canvas_overlay_div(this.parent_div),gamesize,signals)
        this.click_interface_canvas = new ClickInterfaceCanvas(this,canvas_overlay_div(this.parent_div),gamesize,signals)
        //this.analysis_canvas = new AnalysisCanvas(this,canvas_overlay_div(this.parent_div),gamesize,signals)

        //$(this.analysis_canvas.basediv).hide()
        this.handle_signals()
    }
    handle_signals(){
        this.signals.analysis_signal.listen(()=>{
            //$(this.click_interface_canvas.basediv).hide()
            //$(this.analysis_canvas.basediv).show()
        })
        this.signals.stop_analysis_signal.listen(()=>{
            //$(this.click_interface_canvas.basediv).show()
            //$(this.analysis_canvas.basediv).hide()
        })
    }
}
module.exports = {
    GameBoard: GameBoard,
}
