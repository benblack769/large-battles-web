var default_stats = {
    "unit_types": {
        "soldier": {
            "attack_range": 1,
            "move_range": 3,
            "cost": 10,
            "HP": 1,
            "viable_attachments": ["armor"],
        },
        "catapult": {
            "attack_range": 3,
            "move_range": 1,
            "cost": 100,
            "HP": 1,
        },
        "farm": {
            "attack_range": 0,
            "move_range": 0,
            "cost": 50,
            "buildable": true,
            "income": 5,
            "HP": 1,
        },
        "barracks": {
            "attack_range": 0,
            "move_range": 0,
            "buys_per_turn": 2,
            "cost": 100,
            "buildable": true,
            "can_make": ["soldier"],
            "HP": 2,
        },
        "armory": {
            "attack_range": 0,
            "move_range": 0,
            "buys_per_turn": 1,
            "cost": 200,
            "buildable": true,
            "can_make_equip": ["armor"],
            "HP": 2,
        },
    },
    "attachment_types": {
        "armor": {
            "cost": 30,
            "stat_alt": {
                "HP": 1,
            }
        }
    }
}
var icons = {
    "background_icon": "Background.bmp",
    "unit_icons": {
        "soldier": "Soldier.png",
        "catapult": "Catapult.png",
        "farm": "farm.png",
        "barracks": "barracks.png",
        "armory": "armory.png",
    },
}
function calc_stat(stats,unit_info,stat_name){
    var stat_val = stats.unit_types[unit_info.unit_type][stat_name]
    unit_info.attachments.forEach((attach) =>{
        var stat_increase = stats.attachment_types[attach].stat_alt[stat_name]
        if(stat_increase){
            stat_val += stat_increase
        }
    })
    return stat_val
}
function get_all_sources(){
    var unit_icons = Object.values(icons.unit_icons)
    var base_icons = [icons.background_icon]
    return unit_icons.concat(base_icons)
}
module.exports = {
    default_stats: default_stats,
    calc_stat: calc_stat,
    icons: icons,
    get_all_sources: get_all_sources,
}
