var lib = require("../../logic_modules/coord_lib.js")
//var signals = require("./global_signals.js")

function postMessage(signals,message){
    signals.interfaceInstruction.fire(message)
}
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
function clear_highlights(signals){
    postMessage(signals,{
        type: "DRAW_RECTS",
        draw_list: [],
        line_list: []
    })
}
function draw_list(signals,fill_list,line_list){
    postMessage(signals,{
        type: "DRAW_RECTS",
        draw_list: fill_list,
        line_list: (line_list ? line_list : []),
    })
}
class TwoClickHandler {
    constructor(signals){
        this.signals = signals
        this.first_click = null
    }
    handleClick(click,game_state){
        if(!this.first_click){
            var move_range = this.getRange(game_state,click)
            var possible_moves = this.get_all_valid_around(game_state,click,move_range)
            draw_list(this.signals,concat(
                [to_item(click,"rgba(255,0,0,0.4)")],
                coord_list_to_draws(possible_moves,"rgba(128,128,128,0.4)")
            ))
            this.first_click = click
        }
        else{
            this.execAction(click)
            clear_highlights(this.signals)
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
    return lib.is_valid_instr(game_state,instr,game_state.my_player)
}
class MoveHandler extends TwoClickHandler {
    getRange(game_state,click){
        return lib.get_move_range(game_state,click)
    }
    execAction(click2){
        exec_move(this.signals,[this.first_click,click2])
    }
    get_all_valid_around(game_state,start,range){
        return lib.coords_around(game_state,start,range).filter((coord)=>is_valid_move(game_state,start,coord))
    }
}
class BuildHandler {
    constructor(buy_type,game_state,signals){
        this.signals = signals
        this.buy_type = buy_type
        this.calc_buildable_units(game_state)
        this.draw_all(game_state)
    }
    calc_buildable_units(game_state){
        var coord_map = new Map()
        var hashable = JSON.stringify
        lib.all_coords(game_state)
            .filter((coord)=>lib.is_build_radius_unit(game_state,coord))
            .forEach(function(buildable_coord){
                var range = lib.get_build_radius(game_state,buildable_coord)
                lib.get_possible_moves(game_state.map,buildable_coord,range)
                    .forEach(function(target_coord){
                        coord_map.set(hashable(target_coord),buildable_coord)
                    })
            })
        this.coord_map = coord_map
    }
    get_builder(coord){
        return this.coord_map.get(JSON.stringify(coord))
    }
    handleClick(click,game_state){
        var instr = {
            type: "BUILD",
            building_type: this.buy_type,
            builder_coord: this.get_builder(click),
            coord: click,
        }
        postMessage(this.signals,instr)
        lib.simulate_instruction(game_state,instr,game_state.my_player)
        this.draw_all(game_state)
    }
    draw_all(game_state){
        draw_list(this.signals,lib.all_coords(game_state)
           .filter((coord)=>this.is_valid_buy(game_state,coord))
           .map((coord)=>to_item(coord,"rgba(128,128,128,0.4)")))
    }
    is_valid_buy(game_state,coord){
        var instr = {
            type: "BUILD",
            building_type: this.buy_type,
            builder_coord: this.get_builder(coord),
            coord: coord,
        }
        //console.log(lib.get_instr_err(game_state,instr,game_state.my_player))
        return lib.is_valid_instr(game_state,instr,game_state.my_player)
    }
}
class BuySomethingHandler {
    constructor(signals){
        this.signals = signals
        this.first_click = null
        this.buy_type = null
    }
    handleClick(click,game_state){
        if(!this.first_click){
            if(!lib.is_unit(game_state.map,click)){
                return
            }
            var buy_type = this.get_buy_type(game_state,click)
            if(buy_type){
                this.first_click = click
                this.buy_type = buy_type
                var move_range = this.getRange(game_state,click)
                var possible_moves = this.get_all_valid_around(game_state,click,move_range)
                draw_list(this.signals,concat(
                    [to_item(click,"rgba(255,0,0,0.4)")],
                    coord_list_to_draws(possible_moves,"rgba(128,128,128,0.4)")
                ))
            }
        }
        else{
            this.execAction(click)
            clear_highlights(this.signals)
            this.first_click = null
            this.buy_type = null
        }
    }
}

class BuyHandler extends BuySomethingHandler {
    constructor(signals){
        super(signals)
    }
    getRange(game_state,click){
        return 1
    }
    get_buy_type(game_state,coord){
        return lib.get_make_unit(game_state,coord)
    }
    execAction(click2){
        exec_buy(this.signals,[this.first_click,click2],this.buy_type)
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
        return lib.is_valid_instr(game_state,instr,game_state.my_player)
    }
}
class AttachHandler extends BuySomethingHandler {
    constructor(signals){
        super(signals)
    }
    getRange(game_state,click){
        return 1
    }
    get_buy_type(game_state,coord){
        return lib.get_make_equip(game_state,coord)
    }
    execAction(click2){
        exec_equip(this.signals,[this.first_click,click2],this.buy_type)
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
        return lib.is_valid_instr(game_state,instr,game_state.my_player)
    }
}
class AttackHandler extends TwoClickHandler {
    getRange(game_state,click){
        return lib.get_attack_range(game_state,click)
    }
    execAction(click2){
        postMessage(this.signals,{
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
        return lib.is_valid_instr(game_state,instr,game_state.my_player)
    }
    get_all_valid_around(game_state,start,range){
        return lib.coords_around(game_state,start,range).filter((coord)=>this.is_valid_attack(game_state,start,coord))
    }
}
function merge_arrays(array_list){
    return [].concat.apply([], array_list);
}
function make_new_path(game_state,click1,click2){
    var move_range = lib.get_move_range(game_state,click1)
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
    constructor(signals){
        this.signals = signals
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
                var move_range = lib.get_move_range(game_state,source)
                if(lib.distance(current_cen,click) <= move_range){
                    this.current_path.push(click)
                }
            }
        }
        else{
            if(lib.is_moveable_unit(game_state,click)){
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
        draw_list(this.signals,all_fills,this.current_lines())
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
        var move_range = lib.get_move_range(game_state,source)
        var possible_moves = lib.coords_around(null,last(this.current_path),move_range)
        var possible_highlights = possible_moves.map((coord)=>to_item(coord,"rgba(128,128,128,0.2)"))
        return possible_highlights
    }
    make_moves(game_state){
        var new_paths = []
        this.paths().forEach((path)=>{
            if(is_valid_move(game_state,path[0],path[1])){
                exec_move(this.signals,[path[0],path[1]])
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
    constructor(signals){
        this.signals = signals
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
            draw_list(this.signals,this.current_path_highlights(),this.current_lines())
        }
        else{
            if(lib.is_unit(game_state.map,click)){
                this.first_click = click
                this.deleteSource(click)
                draw_list(this.signals,concat(
                    [to_item(click,"rgba(255,0,0,0.4)")],
                    this.current_path_highlights()
                ),this.current_lines())
            }
        }
    }
    switched(){
        this.first_click = null
        draw_list(this.signals,this.current_path_highlights())
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


function exec_buy(signals,clicks,buy_type){
    postMessage(signals,{
        type: "BUY_UNIT",
        building_coord: clicks[0],
        placement_coord: clicks[1],
        buy_type: buy_type,
    })
}
function exec_equip(signals,clicks,buy_type){
    postMessage(signals,{
        type: "BUY_ATTACHMENT",
        building_coord: clicks[0],
        equip_coord: clicks[1],
        equip_type: buy_type,
    })
}
function exec_move(signals,clicks){
    postMessage(signals,{
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
function copy_game_state(game_state,myplayer){
    var new_game_state = lib.deep_copy(game_state)
    new_game_state.my_player = myplayer
    return new_game_state
}
class InterfaceHandler{
    constructor(signals){
        this.signals = signals
        this.move_handler = new MultiMoveHandler(this.signals)
        this.path_handler = new PathHandler(this.signals)
    }
    make_handler(function_id,game_state){
        if(!game_state || !game_state.map){
            return;
        }
        switch(function_id){
            case "build_farm": return new BuildHandler("farm",game_state,this.signals);
            case "build_barracks": return new BuildHandler("barracks",game_state,this.signals);
            case "build_armory": return new BuildHandler("armory",game_state,this.signals);
            case "build_ba_shop": return new BuildHandler("BA_shop",game_state,this.signals);
            case "build_sword_shop": return new BuildHandler("sword_shop",game_state,this.signals);
            case "build_pike_shop": return new BuildHandler("pike_shop",game_state,this.signals);
            case "build_cat_factory": return new BuildHandler("catapult_factory",game_state,this.signals);
            case "build_stable": return new BuildHandler("armory",game_state,this.signals);
            case "build_town_center": return new BuildHandler("town_center",game_state,this.signals);
            case "buy": return new BuyHandler(this.signals);
            case "attach": return new AttachHandler(this.signals);
            case "move": return new MoveHandler(this.signals);
            case "attack": return new AttackHandler(this.signals);
            case "move_multi": this.move_handler.switched(); return this.move_handler;
            case "move_path": this.path_handler.switched(); return this.path_handler;
            default: console.log("bad data type: "+function_id); break;
        }
    }
    set_fn(set_data,game_state,myplayer){
        this.myhandler = this.make_handler(set_data,copy_game_state(game_state,myplayer))
    }
    handle_click(click,game_state,myplayer){
        game_state.my_player = myplayer
        //console.log(game_state)
        this.myhandler.handleClick(click,copy_game_state(game_state,myplayer))
    }
}
module.exports = {
    InterfaceHandler: InterfaceHandler,
}
