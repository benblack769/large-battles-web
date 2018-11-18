
function create_unit(unit_type,player_id){
    return {
        "category": "unit",
        "player": player_id,
        "unit_type": unit_type,
        "status": {
            "moved": true,
            "attacked": true,
            "HP": 0,
            "buys_left": 0,
        },
        "attachments": [],
    }
}

function create_empty(){
    return {
        "category": "empty"
    }
}
module.exports = {
    create_unit: create_unit,
    create_empty: create_empty,
}
