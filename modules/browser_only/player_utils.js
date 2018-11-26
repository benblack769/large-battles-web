var signals = require("./game_display/global_signals.js")
var example_player_state = {
    player_info: {
        "ben's player": {
            money: 500,
        },
        "oragano's player": {
            money: 500,
        }
    },
    player_order: [
        "ben's player",
        "oragano's player",
    ],
    //active_player: "ben's player",
}
function next_player(player_state, active_player){
    var active_player = signals.activePlayer.getState()
    var idx = player_state.player_order.indexOf(active_player)
    var newidx = (idx + 1) % player_state.player_order.length
    var new_id = player_state.player_order[newidx]
    return new_id
}
module.exports = {
    example_player_state: example_player_state,
    next_player: next_player,
}
