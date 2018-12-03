
function coord_list_to_draws(clist,color){
    return clist.map((coord)=>to_item(coord,color))
}
function concat(l1,l2){
    return l1.concat(l2)
}
function to_item(coord,color){
    return {
        coord: coord,
        color: color,
    }
}
function to_line(c1,c2){
    return {
        coord1: c1,
        coord2: c2,
    }
}
function clear_highlights(){
    postMessage({
        type: "DRAW_RECTS",
        draw_list: [],
        line_list: []
    })
}
function draw_coord(coord,color){
    draw_list([to_item(coord,color)])
}
function draw_list(fill_list,line_list){
    postMessage({
        type: "DRAW_RECTS",
        draw_list: fill_list,
        line_list: (line_list ? line_list : []),
    })
}
class TwoClickHandler {
    constructor(){
        this.first_click = null
    }
    handleClick(click,game_state){
        if(!this.first_click){
            var move_range = this.getRange(game_state,click)
            var possible_moves = this.get_all_valid_around(game_state,click,move_range)
            draw_list(concat(
                [to_item(click,"rgba(255,0,0,0.4)")],
                coord_list_to_draws(possible_moves,"rgba(128,128,128,0.4)")
            ))
            this.first_click = click
        }
        else{
            this.execAction(click)
            clear_highlights()
            this.first_click = null
        }
    }
}
class NullHandler {
    handleClick(click,game_state){}
}
function is_valid_move(game_state,start,end){
    var instr = {
        type: "MOVE",
        start_coord: start,
        end_coord: end,
    }
    return !self.lib.validate_instruction(game_state,instr,game_state.my_player)
}
class MoveHandler extends TwoClickHandler {
    getRange(game_state,click){
        return self.lib.get_move_range(game_state,click)
    }
    execAction(click2){
        exec_move([this.first_click,click2])
    }
    get_all_valid_around(game_state,start,range){
        return lib.coords_around(game_state,start,range).filter((coord)=>is_valid_move(game_state,start,coord))
    }
}
class BuyHandler extends TwoClickHandler {
    constructor(buy_type){
        super()
        this.buy_type = buy_type
    }
    getRange(game_state,click){
        return 1
    }
    execAction(click2){
        exec_buy([this.first_click,click2],this.buy_type)
    }
    get_all_valid_around(game_state,start,range){
        return lib.coords_around(game_state,start,range).filter((coord)=>this.is_valid_buy(game_state,start,coord))
    }
    is_valid_buy(game_state,start,end){
        var instr = {
            type: "BUY_UNIT",
            building_coord: start,
            placement_coord: end,
            buy_type: this.buy_type,
        }
        return !self.lib.validate_instruction(game_state,instr,game_state.my_player)
    }
}
class BuildHandler {
    constructor(buy_type){
        this.buy_type = buy_type
    }
    handleClick(click){
        make_building(click,this.buy_type)
    }
}
class AttachHandler extends TwoClickHandler {
    constructor(buy_type){
        super()
        this.buy_type = buy_type
    }
    getRange(game_state,click){
        return 1
    }
    execAction(click2){
        exec_equip([this.first_click,click2],this.buy_type)
    }
    get_all_valid_around(game_state,start,range){
        return lib.coords_around(game_state,start,range).filter((coord)=>this.is_valid_buy(game_state,start,coord))
    }
    is_valid_buy(game_state,start,end){
        var instr = {
            type: "BUY_ATTACHMENT",
            building_coord: start,
            equip_coord: end,
            equip_type: this.buy_type,
        }
        return !self.lib.validate_instruction(game_state,instr,game_state.my_player)
    }
}
class AttackHandler extends TwoClickHandler {
    getRange(game_state,click){
        return self.lib.get_attack_range(game_state,click)
    }
    execAction(click2){
        postMessage({
            type: "ATTACK",
            source_coord: this.first_click,
            target_coord: click2,
        })
    }
    is_valid_attack(game_state,start,end){
        var instr = {
            type: "ATTACK",
            source_coord: start,
            target_coord: end,
        }
        return !self.lib.validate_instruction(game_state,instr,game_state.my_player)
    }
    get_all_valid_around(game_state,start,range){
        return lib.coords_around(game_state,start,range).filter((coord)=>this.is_valid_attack(game_state,start,coord))
    }
}
function merge_arrays(array_list){
    return [].concat.apply([], array_list);
}
function make_new_path(game_state,click1,click2){
    var move_range = self.lib.get_move_range(game_state,click1)
    if(!move_range){
        return null
    }
    var move_path = lib.get_shortest_path(game_state.map,click1,click2)
    if(move_path === null){
        return null
    }
    var mmovepath = []
    var i = 0;
    for(; i < move_path.length; i += move_range){
        mmovepath.push(move_path[i])
    }
    if(i !== move_path.length-1){
        mmovepath.push(move_path[move_path.length-1])
    }
    return mmovepath
}
const hashable = JSON.stringify
function deep_equals(o1,o2){
    return JSON.stringify(o1) === JSON.stringify(o2)
}
function at(map,coord){
    return map[coord.y][coord.x]
}
function last(array){
    return array[array.length-1]
}
function enumerate_map(array,callback){
    var res = [];
    for(var i = 0; i < array.length; i++){
        res.push(callback(array[i],i))
    }
    return res
}
class MultiMoveHandler{
    constructor(){
        this.current_path = []
    }
    paths(){
        return get_data_by_key("move_multi","paths")
    }
    setPaths(paths){
        changeData("move_multi","paths",paths)
    }
    handleClick(click,game_state){
        if(this.current_path.length){
            var source = this.current_path[0]
            var current_cen = last(this.current_path)
            if(deep_equals(current_cen,click)){
                if(this.current_path.length > 1){
                    var paths = this.paths()
                    paths.push(this.current_path)
                    this.setPaths(paths)
                }
                this.current_path = []
            }
            else{
                var move_range = self.lib.get_move_range(game_state,source)
                if(self.lib.distance(current_cen,click) <= move_range){
                    this.current_path.push(click)
                }
            }
        }
        else{
            if(self.lib.is_moveable_unit(game_state,click)){
                this.deleteSource(click)
                this.current_path.push(click)
            }
        }
        this.draw_all(game_state)
    }
    selector_clicked(selector_name,game_state){
        if(selector_name === "OK"){
            this.make_moves(game_state)
        }
        else if(selector_name === "CANCEL"){
            this.setPaths([])
            this.current_path = []
        }
        this.draw_all(game_state)
    }
    switched(){
        this.current_path = []
        this.draw_all(null)
    }
    deleteSource(coord){
        var paths = this.paths()
        for(var i = 0; i < paths.length; i++){
            if(deep_equals(paths[i][0],coord)){
                paths.splice(i,1)
                this.setPaths(paths)
                return
            }
        }
    }
    draw_all(game_state){
        var all_fills = concat(this.current_path_highlights(),this.current_choice_highlights(game_state))
        draw_list(all_fills,this.current_lines())
    }
    current_lines(){
        var all_paths = concat(this.paths(),[this.current_path])
        return merge_arrays(all_paths.map(function(path){
            var res = []
            for(var i = 1; i < path.length; i++){
                res.push(to_line(path[i-1],path[i]))
            }
            return res
        }))
    }
    current_choice_highlights(game_state){
        if(!this.current_path.length){
            return []
        }
        var source = this.current_path[0]
        var move_range = self.lib.get_move_range(game_state,source)
        var possible_moves = lib.coords_around(null,last(this.current_path),move_range)
        var possible_highlights = possible_moves.map((coord)=>to_item(coord,"rgba(128,128,128,0.2)"))
        return possible_highlights
    }
    make_moves(game_state){
        var new_paths = []
        this.paths().forEach((path)=>{
            if(is_valid_move(game_state,path[0],path[1])){
                exec_move([path[0],path[1]])
                if(path.length > 2){
                    path.shift()
                    new_paths.push(path)
                }
            }
        })
        this.setPaths(new_paths)
    }
    current_path_highlights(){
        var all_paths = concat(this.paths(),[this.current_path])
        return  merge_arrays(all_paths.map(function(path){
            if(path.length === 0){
                return []
            }
            else if(path.length === 1){
                return [
                    to_item(path[0],"rgba(255,0,0,0.4)"),
                ]
            }
            var source = path[0]
            var dest = path[path.length-1]
            return merge_arrays([
                [to_item(source,"rgba(255,0,0,0.4)")],
                [to_item(dest,"rgba(0,0,255,0.4)")],
                enumerate_map(path.slice(1,-1),((coord,idx) => to_item(coord,"rgba(0,0,0,"+(1.0/(2.5+idx))+")"))),
            ])
        }))
    }
}
class PathHandler{
    constructor(){
        this.paths = []
        this.first_click = null
    }
    handleClick(click,game_state){
        if(this.first_click){
            var new_path = make_new_path(game_state,this.first_click,click)
            if(new_path){
                this.paths.push(new_path)
            }
            this.first_click = null
            draw_list(this.current_path_highlights(),this.current_lines())
        }
        else{
            if(self.lib.is_unit(game_state.map,click)){
                this.first_click = click
                this.deleteSource(click)
                draw_list(concat(
                    [to_item(click,"rgba(255,0,0,0.4)")],
                    this.current_path_highlights()
                ),this.current_lines())
            }
        }
    }
    switched(){
        this.first_click = null
        draw_list(this.current_path_highlights())
    }
    deleteSource(coord){
        for(var i = 0; i < this.paths.length; i++){
            if(deep_equals(this.paths[i][0],coord)){
                this.paths.splice(i,1)
                return
            }
        }
    }
    current_lines(){
        return merge_arrays(this.paths.map(function(path){
            var res = []
            for(var i = 1; i < path.length; i++){
                res.push(to_line(path[i-1],path[i]))
            }
            return res
        }))
    }
    current_path_highlights(){
        return merge_arrays(this.paths.map(function(path){
            var source = path[0]
            var dest = path[path.length-1]
            return merge_arrays([
                [to_item(source,"rgba(255,0,0,0.4)")],
                [to_item(dest,"rgba(0,0,255,0.4)")],
                path.slice(1,-1).map((coord) => to_item(coord,"rgba(128,128,128,0.4)")),
            ])
        }))
    }
}


function make_building(clicks,type){
    console.log("made building at: "+clicks)
    postMessage({
        type: "BUILD",
        building_type: type,
        coord: clicks,
    })
}
function exec_buy(clicks,buy_type){
    postMessage({
        type: "BUY_UNIT",
        building_coord: clicks[0],
        placement_coord: clicks[1],
        buy_type: buy_type,
    })
}
function exec_equip(clicks,buy_type){
    postMessage({
        type: "BUY_ATTACHMENT",
        building_coord: clicks[0],
        equip_coord: clicks[1],
        equip_type: buy_type,
    })
}
function exec_move(clicks){
    postMessage({
        type: "MOVE",
        start_coord: clicks[0],
        end_coord: clicks[1],
    })
}
function to_rgba(colorname,a){
    switch(colorname){
        case "red": return "rgba(255,0,0,"+a+")";
        case "blue": return "rgba(0,0,255,"+a+")";
    }
}
function draw_occupation(game_state){
    var player_colors = {}
    player_colors[game_state.players.player_order[0]] = "red"
    player_colors[game_state.players.player_order[1]] = "blue"

    var all_highlights = []
    lib.all_coords(game_state).forEach(function(coord){
        var occ = lib.at(game_state.occupied,coord)
        for(var player in occ){
            var color = player_colors[player]
            var val = occ[player]
            var val_max = 10
            var rgba = to_rgba(color,(Math.min(1,val/val_max))*0.5)
            all_highlights.push(to_item(coord,rgba))
        }
    })
    draw_list(all_highlights)
}
var move_handler = new MultiMoveHandler()
var path_handler = new PathHandler()
function make_handler(function_id,game_state){
    switch(function_id){
        case "build_farm": return new BuildHandler("farm");
        case "build_barracks": return new BuildHandler("barracks");
        case "build_armory": return new BuildHandler("armory");
        case "buy_soldier": return new BuyHandler("soldier");
        case "buy_armor": return new AttachHandler("armor");
        case "move": return new MoveHandler();
        case "attack": return new AttackHandler();
        case "draw_occupation": draw_occupation(game_state); return new NullHandler();
        case "move_multi": move_handler.switched(); return move_handler;
        case "move_path": path_handler.switched(); return path_handler;
        default: console.log("bad data type: "+function_id); break;
    }
}
self.on_selector_click = function(selector_name,game_state){
    console.log("selection reached lib: "+selector_name)
    myhandler.selector_clicked(selector_name,game_state)
}
//do not change this code unless you know what you are doing
self.on_set_fn = function(set_data,game_state){
    myhandler = make_handler(set_data,game_state)
}
self.click_handler = function(click,game_state,active_player){
    //console.log(game_state)
    myhandler.handleClick(click,game_state)
}
