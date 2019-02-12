var base_ops = require("./base_ops.js")
var types = require("./types.js")

function sum(arr){
    return arr.reduce((a,b)=>(a+b),0)
}

function get_heuristcs(game_state,player){
    var cash = game_state.players.player_info[player].money
    var income = base_ops.get_current_income(game_state,player)
    var my_units = base_ops.all_units_on_board(game_state)
                           .map((unit)=>unit.unit)
                           .filter((unit)=>unit.player === player)
    //console.log(base_ops.all_units_on_board(game_state))
    my_units.forEach((unit)=>{
        console.assert(unit.attachments.length < 5)
    })
    var military_cost = sum(my_units.filter((unit)=>types.is_military(game_state.stats,unit))
                           .map((unit)=>types.get_cost(game_state.stats,unit)))
    var other_cost = sum(my_units.filter((unit)=>!types.is_military(game_state.stats,unit))
                        .map((unit)=>types.get_cost(game_state.stats,unit)))
    return {
        cash: cash,
        income: income,
        military_cost: military_cost,
        other_cost: other_cost,
    }
}
module.exports = {
    get_heuristcs: get_heuristcs,
}
