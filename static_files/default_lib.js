
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
class MultiMoveHandler{
    constructor(){
        this.paths = []
        this.current_path = []
    }
    handleClick(click,game_state){
        if(this.current_path.length){
            var source = this.current_path[0]
            var current_cen = last(this.current_path)
            if(deep_equals(current_cen,click)){
                if(this.current_path.length > 1){
                    this.paths.push(this.current_path)
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
            if(self.lib.is_unit(game_state.map,click)){
                this.deleteSource(click)
                this.current_path.push(click)
            }
        }
        this.draw_all(game_state)
    }
    switched(){
        this.current_path = []
        this.draw_all(null)
    }
    deleteSource(coord){
        for(var i = 0; i < this.paths.length; i++){
            if(deep_equals(this.paths[i][0],coord)){
                this.paths.splice(i,1)
                return
            }
        }
    }
    draw_all(game_state){
        var all_fills = concat(this.current_path_highlights(),this.current_choice_highlights(game_state))
        draw_list(all_fills,this.current_lines())
    }
    current_lines(){
        var all_paths = concat(this.paths,[this.current_path])
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
        return possible_moves.map((coord)=>to_item(coord,"rgba(128,128,128,0.2)"))
    }
    make_moves(game_state){
        var new_paths = []
        this.paths.forEach((path)=>{
            if(is_valid_move(game_state,path[0],path[1])){
                exec_move([path[0],path[1]])
                if(path.length > 2){
                    path.shift()
                    new_paths.push(path)
                }
            }
        })
        this.paths = new_paths
    }
    current_path_highlights(){
        var all_paths = concat(this.paths,[this.current_path])
        return []/* merge_arrays(all_paths.map(function(path){
            var source = path[0]
            var dest = path[path.length-1]
            return merge_arrays([
                [to_item(source,"rgba(255,0,0,0.4)")],
                [to_item(dest,"rgba(0,0,255,0.4)")],
                path.slice(1,-1).map((coord) => to_item(coord,"rgba(128,128,128,0.4)")),
            ])
        }))*/
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
var move_handler = new MultiMoveHandler()
var path_handler = new PathHandler()
function make_handler(data,game_state){
    switch(data.type){
        case "buy_unit": return new BuyHandler(data.unit_type);
        case "build": return new BuildHandler(data.unit_type);
        case "buy_equipment": return new AttachHandler(data.equip_type);
        case "move": return new MoveHandler();
        case "attack": return new AttackHandler();
        case "move_multi": move_handler.switched(); return move_handler;
        case "move_path": path_handler.switched(); return path_handler;
        case "exec_multi_move": move_handler.make_moves(game_state); move_handler.switched(); return move_handler;
        default: console.log("bad data type"); break;
    }
}
//do not change this code unless you know what you are doing
self.on_set_fn = function(set_data,game_state){
    myhandler = make_handler(set_data,game_state)
}
self.click_handler = function(click,game_state,active_player){
    //console.log(game_state)
    myhandler.handleClick(click,game_state)
}
