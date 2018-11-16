var signal_lib = require("../../logic_modules/signals.js")
var Signal = signal_lib.Signal
var StateHolder = signal_lib.StateHolder

module.exports = {
    Signal: Signal,
    clear_highlights: new Signal(),
    clickOccurred: new Signal(),
    selectedData: new StateHolder(),
    ended_turn: new Signal(),
    activePlayer: new StateHolder(),
    myPlayer: new StateHolder(),
    gameStateChange: new Signal(),
    libData: new StateHolder(),
    layoutChanged: new StateHolder(),
    highlightCommand: new Signal(),
}
