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
    players_order: [
        "ben's player",
        "oragano's player",
    ],
    active_player: "ben's player",
}
function init_player_interface(state, active_player, myplayer){
    for(var id in state.player_info){
        signals.gameStateChange.fire({
            type: "SET_MONEY",
            player: id,
            amount: state.player_info[id].money
        })
    }
    signals.activePlayer.setState(active_player)
    signals.myPlayer.setState(myplayer)
}
function next_player(player_state, active_player){
    var active_player = signals.activePlayer.getState()
    var idx = player_state.players_order.indexOf(active_player)
    var newidx = (idx + 1) % player_state.players_order.length
    var new_id = player_state.players_order[newidx]
    return new_id
}
module.exports = {
    example_player_state: example_player_state,
    next_player: next_player,
    init_player_interface: init_player_interface,
}
