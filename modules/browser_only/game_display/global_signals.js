var signal_lib = require("../../logic_modules/signals.js")
var Signal = signal_lib.Signal
var StateHolder = signal_lib.StateHolder

function all_signals(){
    this.clear_highlights = new Signal()
    this.clickOccurred = new Signal()
    this.analysisClickOccurred = new Signal()
    this.selectedData = new StateHolder()
    this.pannelSelector = new Signal()
    this.playerColors = new StateHolder()
    this.ended_turn = new Signal()
    this.activePlayer = new StateHolder()
    this.myPlayer = new StateHolder()
    this.gameStateChange = new Signal()
    this.highlightCommand = new Signal()
    this.interfaceInstruction = new Signal()
    this.analysis_navigation = new Signal()
    this.analysis_signal = new Signal()
    this.stop_analysis_signal = new Signal()
}

module.exports = {
    Signal: Signal,
    StateHolder: StateHolder,
    all_signals: all_signals,
}
