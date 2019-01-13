var MainCoordLearner = require("./major_coord_learner.js").MainCoordLearner
var state_compare = require("./state_comparitor.js")
var sample_move = require("./sample_move.js")
var binary = require("./to_binary.js")
var flatten = require("./ai_utils.js").flatten
var StateComparitor = state_compare.StateComparitor

class MainAI{
    constructor(train_records,train_myplayer){
        var first_instr = train_records[0][0]
        this.game_size = first_instr.game_size
        //this.train_successes = 0
        this.main_coord_learner = new MainCoordLearner(this.game_size)
        this.state_comparitor = new StateComparitor(this.game_size)
        this.trained = 0
        this.main_coord_learner.train_on(train_records,train_myplayer,()=>{
            console.log("main_coord_learner trained")
            this.trained++
        })
        this.state_comparitor.train_on(train_records,train_myplayer,()=>{
            console.log("state_comparitor trained")
            this.trained++
        })
    }
    is_trained(){
        return this.trained === 2
    }
    get_recomended_instr(game_state,myplayer,callback){
        var cmapper = new binary.CoordMapper(game_state.stats,game_state.players.player_order,myplayer)
        this.main_coord_learner.get_prob_map(game_state,myplayer,(prob_map)=>{
            var num_samples = 0;
            const max_samples = 1000;
            var major_coords = sample_move.sample_prob_map(game_state,prob_map,max_samples)
            for(var i = 0; i < major_coords.length; i++){
                var valid_moves = sample_move.all_moves_given_major(game_state,major_coords[i],myplayer)
                if(valid_moves.length){
                    state_compare.tournament_eval(valid_moves,game_state,this.state_comparitor,cmapper,callback)
                    return
                }
            }
            callback(null)
            return
        })
    }
    get_prob_map(game_state,myplayer,callback){
        this.main_coord_learner.get_prob_map(game_state,myplayer,callback)
    }
}
module.exports = {
    MainAI: MainAI,
}
