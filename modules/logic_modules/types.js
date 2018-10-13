var data = {
    "background_icon": "Background.bmp",
    "unit_types": {
        "soldier": {
            "stats": {
                "range": 1
            },
            "icon": "Soldier.png"
        },
        "catapult": {
            "stats": {
                "range": 3
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
