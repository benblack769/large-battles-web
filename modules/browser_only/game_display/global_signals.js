class Signal {
    constructor(initial_state){
        this.listeners = []
    }
    listen(func){
        this.listeners.push(func)
    }
    fire(data){
        this.listeners.forEach(function(func){
            func(data)
        })
    }
}
class StateHolder {
    constructor(initial_state){
        this.listeners = []
        this._state = initial_state
    }
    getState(){
        return this._state
    }
    setState(newstate){
        this._state = newstate
        this.listeners.forEach(function(func){
            func(newstate)
        })
    }
    listen(func){
        this.listeners.push(func)
    }
}

module.exports = {
    Signal: Signal,
    clear_clicks: new Signal(),
    click_state_finished: new Signal(),
    selectedData: new StateHolder(),
    clickCycleFinished: new Signal(),
    ended_turn: new Signal(),
    activePlayer: new StateHolder(),
    myPlayer: new StateHolder(),
    moneyChange: new Signal(),
    gameStateChange: new Signal(),
}
