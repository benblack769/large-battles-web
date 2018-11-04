class Signal {
    constructor(initial_state){
        this.listeners = []
    }
    listen(func){
        this.listeners.push(func)
    }
    fire(){
        this.listeners.forEach(function(func){
            func()
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
    clickCycleFinished: new StateHolder(),
}
