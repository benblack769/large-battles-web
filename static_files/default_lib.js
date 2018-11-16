
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
class MoveHandler {
    constructor(){
        this.first_click = null
    }
    handleClick(click,game_state){
        if(!this.first_click){
            this.first_click = click
            var move_range = self.lib.get_move_range(game_state,click)
            var possible_moves = self.lib.get_possible_moves(game_state.map,click,move_range)
            //console.log(possible_moves)
            draw_list(concat(
                [to_item(click,"rgba(255,0,0,0.4)")],
                coord_list_to_draws(possible_moves,"rgba(128,128,128,0.4)")
            ))
        }
        else{
            exec_move([this.first_click,click])
            clear_highlights()
            this.first_click = null
        }
    }
}
class BuyHandler {
    constructor(buy_type){
        this.first_click = null
        this.buy_type = buy_type
    }
    handleClick(click){
        if(!this.first_click){
            this.first_click = click
            draw_coord(click,"rgba(255,0,0,0.4)")
        }
        else{
            exec_buy([this.first_click,click],this.buy_type)
            clear_highlights()
            this.first_click = null
        }
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
class AttachHandler {
    constructor(buy_type){
        this.first_click = null
        this.buy_type = buy_type
    }
    handleClick(click){
        if(!this.first_click){
            this.first_click = click
            draw_coord(click,"rgba(255,0,0,0.4)")
        }
        else{
            exec_equip([this.first_click,click],this.buy_type)
            clear_highlights()
            this.first_click = null
        }
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
        default: console.log("bad data type"); break;
    }
}
//do not change this code unless you know what you are doing
self.on_set_fn = function(set_data){
    myhandler = make_handler(set_data)
}
self.click_handler = function(click,game_state,active_player){
    console.log(game_state)
    myhandler.handleClick(click,game_state)
}
