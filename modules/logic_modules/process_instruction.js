function valid_move(gamestate,instr){
    return true;
}
var validate_funcs = {
    "MOVE": valid_move,
}
function validate_instruction(gamestate,instr){
    try{
        if(instr.type && validate_funcs[instr.type]) {
            validate_funcs[instr.type](gamestate,instr)
        }
        else{
            throw new Error('Bad type')
        }
        return true;
    }
    catch(e) {
        console.log("ERROR "+e.name+": \n"+e.message)
        return false;
    }
}
function exec_move(gamestate,instr){

}
var exec_funcs = {
    "MOVE": exec_move,
}
function execute_instruction(gamestate,instr){
    funcs[instr.type](gamestate,instr)
}
