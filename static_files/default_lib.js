
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
function clear_highlights(){
    postMessage({
        type: "DRAW_RECTS",
        draw_list: []
    })
}
function draw_coord(coord,color){
    draw_list([to_item(coord,color)])
}
function draw_list(cclist){
    console.log(cclist)
    postMessage({
        type: "DRAW_RECTS",
        draw_list: cclist,
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
            //console.log(possible_moves)
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
class MoveHandler extends TwoClickHandler {
    getRange(game_state,click){
        return self.lib.get_move_range(game_state,click)
    }
    execAction(click2){
        exec_move([this.first_click,click2])
    }
    is_valid_move(game_state,start,end){
        var instr = {
            type: "MOVE",
            start_coord: start,
            end_coord: end,
        }
        return !self.lib.validate_instruction(game_state,instr,game_state.my_player)
    }
    get_all_valid_around(game_state,start,range){
        return lib.coords_around(game_state,start,range).filter((coord)=>this.is_valid_move(game_state,start,coord))
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
var myhandler = new MoveHandler()
function make_handler(data){
    switch(data.type){
        case "buy_unit": return new BuyHandler(data.unit_type);
        case "build": return new BuildHandler(data.unit_type);
        case "buy_equipment": return new AttachHandler(data.equip_type);
        case "move": return new MoveHandler();
        case "attack": return new AttackHandler();
        default: console.log("bad data type"); break;
    }
}
//do not change this code unless you know what you are doing
self.on_set_fn = function(set_data){
    myhandler = make_handler(set_data)
}
self.click_handler = function(click,game_state,active_player){
    //console.log(game_state)
    myhandler.handleClick(click,game_state)
}
