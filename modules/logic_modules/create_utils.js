
function create_unit(unit_type,player_id){
    return {
        "category": "unit",
        "player": player_id,
        "unit_type": unit_type,
    }
}

module.exports = {
    create_unit: create_unit,
}
