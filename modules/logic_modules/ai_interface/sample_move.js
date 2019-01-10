var clib = require("../coord_lib.js")
var ai_utils = require("./ai_utils.js")
var type_utils = require("./type_utils.js")

function find_idx(arr,val,low,high){
    var mid = Math.floor((low + high) / 2);
    if(arr[mid+1] <= val){
        return find_idx(arr,val,mid+1,high);
    }
    else if(arr[mid] > val){
        return find_idx(arr,val,low,mid);
    }
    else{
        return mid;
    }
}
class DiscreteDistribution {
    constructor(val_array){
        var length = val_array.length;
        var prob_cumsum = new Array(length+1);
        var sum = 0;
        for(var i = 0; i < length; i++){
            prob_cumsum[i] = sum;
            sum += val_array[i];
        }
        prob_cumsum[length] = sum;
        this.prob_cumsum = prob_cumsum
        this.final = sum
        console.log(this.prob_cumsum)
    }
    sample(){
        var search_val = Math.random()*this.final
        var idx = find_idx(this.prob_cumsum,search_val,0,this.prob_cumsum.length)
        return idx
    }
}
function idx_to_coord(idx,game_size){
    return {x:Math.floor(idx/game_size.xsize),y:idx%game_size.xsize}
}
function sample_coord(map_dist,game_size){
    return idx_to_coord(map_dist.sample(),game_size)
}
function randInt(max){
    return Math.floor(Math.random()*max)
}
function sample_instruction_at(instrs,game_state,myplayer){
    while(instrs.length){
        var idx = randInt(instrs.length)
        var instr = instrs[idx]
        if(clib.is_valid_instr(game_state,instr,myplayer)){
            return instr
        }
        else{
            instrs.splice(idx,1)
        }
    }
    return null
}
function sample_moves(game_state,major_prob_map,myplayer,num_moves_to_sample){
    var flat_prob_map = ai_utils.flatten(major_prob_map)
    var dist = new DiscreteDistribution(flat_prob_map)
    var moves = []
    var sample_count = 0;
    for(var i = 0; i < num_moves_to_sample; i++){
        do{
            var major_coord = sample_coord(dist,game_state.game_size)
            var instrs = type_utils.all_moves_from(game_state,major_coord,myplayer)
            console.log(major_coord)
            console.log(JSON.stringify(instrs,null,2))
            var instr = sample_instruction_at(instrs,game_state,myplayer)
            sample_count++;
            if(sample_count > num_moves_to_sample*10){
                return moves
            }
        }while(!instr);
        moves.push(instr)
    }
    return moves
}
module.exports = {
    sample_moves: sample_moves,
}
