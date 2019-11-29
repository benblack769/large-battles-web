var WebSocket = require('ws');
var fs = require('fs')
var array_nd = require('logic_modules/array_nd.js')

var train_records = [
    'fixed_large_record.json',
    'second_large_record.json',
]

class WebEvaluator {

}

function train_move(move_prob_evaluator,state_evaluator,move_generator,state){
    move_prob_evaluator.conc
}

function calc_transition(move_prob_evaluator,state_evaluator,move_generator,state){
    
}

function q_learner_trainer(evaluator){

}

class RemoteEvaluator {
    constructor(model_id){
        this.model = model_id
        this.ws = new WebSocket("ws://localhost:13254")
    }
    calc_value(input){
        return this.ws
    }
    train_value(input,output){

    }
}

ws.on('open', function open() {
  ws.send('something');
  console.log("sent!")
  ws.on('message', function(data){

  })
});
