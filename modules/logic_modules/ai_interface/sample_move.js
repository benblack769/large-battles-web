var clib = require("../coord_lib.js")
var type_utils = require("./type_utils.js")
var random = require("../random_helpers.js")

function idx_to_coord(idx,game_size){
    return {x:idx%game_size.xsize,y:Math.floor(idx/game_size.xsize)}
}
function sample_coord(map_dist,game_size){
    return idx_to_coord(map_dist.sample(),game_size)
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
function all_moves_given_major(game_state,major_coord,myplayer){
    var instrs = type_utils.all_moves_from(game_state,major_coord,myplayer)
        .filter(instr=>clib.is_valid_instr(game_state,instr,myplayer))
    return instrs
}
function unique_coords(coords){
    return Array.from(new Set(coords.map(JSON.stringify)))
        .map(JSON.parse)
}
function sample_prob_map(game_state,major_prob_map,num_samples){
    var flat_prob_map = array_nd.flatten(major_prob_map)
    for(var i = 0; i < flat_prob_map.length; i++){
        flat_prob_map[i] *= flat_prob_map[i]
    }
    var dist = new random.DiscreteDistribution(flat_prob_map)
    var major_coords = (new Array(num_samples).fill(0))
        .map(()=>sample_coord(dist,game_state.game_size))
    var unique_majors =  unique_coords(major_coords)
    console.log(unique_majors)
    return unique_majors
}
function sample_moves(game_state,major_prob_map,myplayer,num_moves_to_sample){
    var flat_prob_map = array_nd.flatten(major_prob_map)
    var dist = new random.DiscreteDistribution(flat_prob_map)
    var moves = []
    var sample_count = 0;
    for(var i = 0; i < num_moves_to_sample; i++){
        do{
            var major_coord = sample_coord(dist,game_state.game_size)
            var instrs = type_utils.all_moves_from(game_state,major_coord,myplayer)
            var instr = sample_instruction_at(instrs,game_state,myplayer)
            sample_count++;
            if(sample_count > num_moves_to_sample*30){
                return moves
            }
        }while(!instr);
        moves.push(instr)
    }
    return moves
}
module.exports = {
    shuffle: random.shuffle,
    sample_prob_map: sample_prob_map,
    sample_moves: sample_moves,
    all_moves_given_major: all_moves_given_major,
    sample_fixed_num: random.sample_fixed_num,
}
