
function major_coord(instr){
    switch(instr.type){
        case "MOVE": return instr.start_coord;
        case "ATTACK": return instr.source_coord;
        case "BUILD": return null;//instr.coord;
        case "BUY_UNIT": return instr.building_coord;
        case "END_TURN": return null;
        case "BUY_ATTACHMENT": return instr.building_coord;
        case "GAME_STARTED": return null;
    }
}

function minor_coord(instr){
    switch(instr.type){
        case "MOVE": return instr.end_coord;
        case "ATTACK": return instr.target_coord;
        case "BUILD": return null;//instr.coord;
        case "BUY_UNIT": return instr.placement_coord;
        case "END_TURN": return null;
        case "BUY_ATTACHMENT": return instr.equip_coord;
        case "GAME_STARTED": return null;
    }
}
module.exports = {
    major_coord: major_coord,
    minor_coord: minor_coord,
}
