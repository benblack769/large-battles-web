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
    clear(){
        this.listeners = []
    }
}
class StateHolder {
    constructor(initial_state){
        this.listeners = []
        this._state = initial_state
        this.initial_state = this._state
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
    clear(){
        this._state = this.initial_state
        this.listeners = []
    }
    listen(func){
        this.listeners.push(func)
    }
}

module.exports = {
    Signal: Signal,
    StateHolder: StateHolder,
}
