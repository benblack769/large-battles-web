var create_utils = require("./create_utils.js")
function order_element_first(player_order,myplayer){
    var order_copy = player_order.slice()
    var myidx = order_copy.indexOf(myplayer)
    order_copy[myidx] = order_copy[0]
    order_copy[0] = myplayer
    return order_copy
}
class CoordMapper {
    constructor(stats,players,myplayer){
        this.num_idxs = 2//1 element to define empty, one for not on map
        var unit_names = Object.keys(stats.unit_types)
        this.unit_mapper = this.to_idx_map(unit_names)
        var attach_names = Object.keys(stats.attachment_types)
        this.attach_mapper = this.to_idx_map(attach_names)
        var ordered_players = order_element_first(players,myplayer)
        this.player_mapper = this.to_idx_map(ordered_players)
        var example_unit_status = create_utils.create_unit("null","null").status
        var status_keys = Object.keys(example_unit_status)
        this.status_mapper = this.to_idx_map(status_keys)
    }
    add_idx(){
        var idx = this.num_idxs
        this.num_idxs++;
        return idx;
    }
    to_idx_map(arr){
        var idx_map = {};
        arr.forEach((key)=>{
            idx_map[key] = this.add_idx();
        })
        return idx_map;
    }
    coord_to_vec(cdata){
        const start_idx = 0;
        var farr = new Float32Array(this.num_idxs)
        if(cdata === undefined){
            farr[start_idx+0] = 1.0
        }
        else if(cdata === "E"){
            farr[start_idx+1] = 1.0
        }
        else if(cdata.category === "unit"){
            //is unit
            farr[start_idx+this.unit_mapper[cdata.unit_type]] = 1.0
            farr[start_idx+this.player_mapper[cdata.player]] = 1.0
            cdata.attachments.forEach(function(attach){
                farr[start_idx+this.attach_mapper[attach]] = 1.0
            })
            for(var skey in cdata.status){
                farr[start_idx+this.status_mapper[skey]] = Number(cdata.status[skey])
            }
        }
        else{
            throw new Error("encountered bad coord in coord_to_vec:"+JSON.stringify(cdata))
        }
        return farr
    }
    map_to_vec(map){
        var ylen = map.length
        var xlen = map[0].length
        //var array = new Float32Array(this.num_idxs*ylen*xlen)
        var res = []
        for(var y = 0; y < ylen; y++){
            var xres = []
            for(var x = 0; x < xlen; x++){
                xres.push(this.coord_to_vec(map[y][x]))
            }
            res.push(xres)
        }
        return res
    }
}
function map_to_vec(game_state,myplayer){
    var cmap = new CoordMapper(game_state.stats,game_state.players.player_order,myplayer)
    return cmap.map_to_vec(game_state.map)
}

module.exports = {
    CoordMapper: CoordMapper,
    map_to_vec: map_to_vec,
}
