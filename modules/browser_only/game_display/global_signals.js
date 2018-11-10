var signal_lib = require("../../logic_modules/signals.js")
var Signal = signal_lib.Signal
var StateHolder = signal_lib.StateHolder

function clear_all_listeners(){
    module.exports.clear_clicks.clear()
    module.exports.click_state_finished.clear()
    module.exports.selectedData.clear()
    module.exports.clickCycleFinished.clear()
    module.exports.ended_turn.clear()
    module.exports.activePlayer.clear()
    module.exports.myPlayer.clear()
    module.exports.gameStateChange.clear()
}
module.exports = {
    Signal: Signal,
    clear_all_listeners: clear_all_listeners,
    clear_clicks: new Signal(),
    click_state_finished: new Signal(),
    selectedData: new StateHolder(),
    clickCycleFinished: new Signal(),
    ended_turn: new Signal(),
    activePlayer: new StateHolder(),
    myPlayer: new StateHolder(),
    gameStateChange: new Signal(),
}
