var validate = require("./validate_instruction.js")
var decompose = require("./decompose_instructions.js")
var consume = require("./consume_instructions.js")
var clib = require("./coord_lib.js")

const instrs_per_state = 30

class MajorIndicies {
    constructor(record){
        this.major_indicies = []
        this.prev_major = []
        var major_idx = 0;
        for(var i = 0; i < record.length; i++){
            if( i === 0 ||
                i === record.length-1 ||
                record[i].type === "END_TURN" ||
                record[i].type === "GAME_STARTED"){
                    this.major_indicies.push(i)
                    major_idx++
            }
            this.prev_major.push(major_idx-1)
        }
        this.minor_idx = 0;
    }
    incMinor(){
        this.minor_idx = Math.min(this.minor_idx+1,this.maxMinorIdx())
    }
    decMinor(){
        this.minor_idx = Math.max(this.minor_idx-1,0)
    }
    incMajor(){
        var cur_major = this.calcMajorIdx(this.minor_idx)
        var next_major = Math.min(cur_major+1,this.maxMajorIdx())
        this.minor_idx = this.calcMinorIdx(next_major)
    }
    decMajor(){
        var cur_major = this.calcMajorIdx(this.minor_idx)
        var next_major = Math.max(cur_major-1,0)
        this.minor_idx = this.calcMinorIdx(next_major)
    }
    setMinor(val){
        this.minor_idx = val
    }
    getMinor(){
        return this.minor_idx
    }
    getMajor(){
        return this.calcMajorIdx(this.minor_idx)
    }
    calcMinorIdx(major_idx){
        return this.major_indicies[major_idx]
    }
    calcMajorIdx(minor_idx){
        return this.prev_major[minor_idx]
    }
    maxMajorIdx(){
        return this.prev_major[this.prev_major.length-1]
    }
    maxMinorIdx(){
        return this.major_indicies[this.major_indicies.length-1]
    }

}

class RecordAccessor {
    constructor(record){
        this.cached_states = []
        this.cached_decomped_instrs = []
        var cur_game_state = {}

        for(var i = 0; i < record.length; i++){
            var instruction = record[i]
            var active_player = cur_game_state.players ? cur_game_state.players.active_player : "__server";
            var error = validate.validate_instruction(cur_game_state,instruction,active_player)
            if(error){
                var alert_str = "Game record has an error. Possibly from an incompatable version of the game. Error message: "+error.message
                console.assert(alert_str)
            }
            var instr_parts = decompose.decompose_instructions(cur_game_state,instruction,active_player)
            instr_parts.forEach(function(part){
                //change local game state
                consume.consume_change(cur_game_state,part)
            })
            this.cached_decomped_instrs.push(instr_parts)
            if(i % instrs_per_state === 0){
                this.cached_states.push(clib.deep_copy(cur_game_state))
            }
        }
    }
    size(){
        return this.cached_decomped_instrs.length
    }
    get_state(idx){
        var cached_state_idx = Math.floor(idx/instrs_per_state)
        var game_state = clib.deep_copy(this.cached_states[cached_state_idx])
        var start_idx = instrs_per_state * cached_state_idx + 1
        for(var i = start_idx; i <= idx; i++){
            var decoped_instrs = this.cached_decomped_instrs[i]
            for(var j = 0; j < decoped_instrs.length; j++){
                consume.consume_change(game_state,decoped_instrs[j])
            }
        }
        return game_state
    }
}
module.exports = {
    RecordAccessor: RecordAccessor,
    MajorIndicies: MajorIndicies,
}
