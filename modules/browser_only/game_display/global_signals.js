var signal_lib = require("../../logic_modules/signals.js")
var Signal = signal_lib.Signal
var StateHolder = signal_lib.StateHolder

function clear_all_signals(){
    module.exports.clear_highlights.clear()
    module.exports.clickOccurred.clear()
    module.exports.selectedData.clear()
    module.exports.ended_turn.clear()
    module.exports.playerColors.clear()
    module.exports.activePlayer.clear()
    module.exports.myPlayer.clear()
    module.exports.gameStateChange.clear()
    module.exports.libData.clear()
    module.exports.layoutChanged.clear()
    module.exports.buttonData.clear()
    module.exports.selectorClicked.clear()
    module.exports.highlightCommand.clear()
}

module.exports = {
    Signal: Signal,
    clear_all_signals: clear_all_signals,
    clear_highlights: new Signal(),
    clickOccurred: new Signal(),
    selectedData: new StateHolder(),
    playerColors: new StateHolder(),
    ended_turn: new Signal(),
    activePlayer: new StateHolder(),
    myPlayer: new StateHolder(),
    gameStateChange: new Signal(),
    libData: new StateHolder(),
    layoutChanged: new StateHolder(),
    buttonData: new StateHolder(),
    selectorClicked: new Signal(),
    highlightCommand: new Signal(),
}
