var signals = require("./game_display/global_signals.js")
var example_player_state = {
    players_info: {
        "ben's player": {
            money: 120,
        },
        "oragano's player": {
            money: 120,
        }
    },
    players_order: [
        "ben's player",
        "oragano's player",
    ],
}
function init_player_interface(state, active_player, myplayer){
    for(var id in state.players_info){
        signals.moneyChange.fire({
            player: id,
            money: state.players_info[id].money
        })
    }
    signals.activePlayer.setState(active_player)
    signals.myPlayer.setState(myplayer)
}
function turn_ended(state, active_player){
    var active_player = signals.activePlayer.getState()
    var idx = state.players_order.indexOf(active_player)
    var newidx = (idx + 1) % state.players_order.length
    var new_id = state.players_order[newidx]
    signals.activePlayer.setState(new_id)
}
module.exports = {
    example_player_state: example_player_state,
    turn_ended: turn_ended,
    init_player_interface: init_player_interface,
}
