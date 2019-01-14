var accessor = require("../record_accessor.js")
var random = require("../random_helpers.js")
var binary = require("./to_binary.js")
var type_utils = require("./type_utils.js")

class RandomRecordsSampler{
    constructor(records){
        var record_lens = records.map((record)=>record.length)
        this.record_distri = new random.DiscreteDistribution(record_lens)
        this.records = records
    }
    sample_idx(){
        var record_idx = this.record_distri.sample()
        var record = this.records[record_idx]
        var record_len = record.length
        var idx = random.randInt(record_len)
        return [ record_idx, idx]
    }
    sample_idx_until(condition){
        do{
            var idxs = this.sample_idx()
        } while(!condition(idxs));

        return idxs
    }
}
function rotate_right(map){
    var nxsize = map.length
    var nysize = map[0].length
    var new_map = new Array(nysize)
    for(var i = 0; i < nysize; i++){
        new_map[i] = new Array(nxsize)
        for(var j = 0; j < nxsize; j++){
            new_map[i][j] = map[nxsize-1-j][i]
        }
    }
    return new_map
}
class LearnStreamer{
    constructor(records,myplayer){
        this.records = records
        this.record_sampler = new RandomRecordsSampler(records)
        this.accessors = records.map(record=> new accessor.RecordAccessor(record))
        this.myplayer = myplayer
        this.binary_mappers = records.map(function(record){
            var first_instr = record[0]
            return new binary.CoordMapper(first_instr.stats,first_instr.player_order,myplayer)
        })
    }
    rotate_batch(batch_maps){
        var batch_size = batch_maps.length
        var rotated_batch_maps = new Array(batch_size*4)
        for(var j = 0; j < batch_size; j++){
            rotated_batch_maps[j] = batch_maps[j]
        }
        for(var i = 1; i < 4; i++){
            var orig_off = ((i-1) * batch_size)
            var alt_off = (i * batch_size)
            for(var j = 0; j < batch_size; j++){
                rotated_batch_maps[j+alt_off] = rotate_right(rotated_batch_maps[j+orig_off])
            }
        }
        return rotated_batch_maps
    }
    get_batch_idxs(batch_size,condition){
        return (new Array(batch_size)).fill(0).map(()=>{
            return this.record_sampler.sample_idx_until(condition)
        })
    }
    idxBefore(idxs){
        var [r_idx,idx] = idxs
        if(idx <= 0){
            console.assert("bad index for idxBefore")
        }
        return [r_idx,idx-1]
    }
    getInstr(idxs){
        var [r_idx,idx] = idxs
        return this.records[r_idx][idx]
    }
    getState(idxs){
        var [r_idx,idx] = idxs
        var state = this.accessors[r_idx].get_state(idx)
        return state
    }
    getBinState(idxs){
        var [r_idx,idx] = idxs
        return this.binary_mappers[r_idx].map_to_vec(this.getState(idxs).map)
    }
}
module.exports = {
    LearnStreamer: LearnStreamer,
}
