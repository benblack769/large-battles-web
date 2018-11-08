var data = {
    "background_icon": "Background.bmp",
    "unit_types": {
        "soldier": {
            "stats": {
                "attack_range": 1,
                "move_range": 3,
            },
            "icon": "Soldier.png"
        },
        "catapult": {
            "stats": {
                "attack_range": 3,
                "move_range": 1,
            },
            "icon": "Catapult.png"
        }
    }
}

function get_all_sources(){
    var unit_icons = Object.values(data.unit_types).map(function(type){return type['icon']})
    var base_icons = [data.background_icon]
    return unit_icons.concat(base_icons)
}
module.exports = {
    background_icon: data.background_icon,
    unit_types: data.unit_types,
    get_all_sources: get_all_sources,
}
