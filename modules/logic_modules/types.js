var default_stats = {
    "unit_types": {
        "soldier": {
            "attack_range": 1,
            "move_range": 2,
            "attack_strength": 1,
            "cost": 20,
            "max_HP": 2,
            "viable_attachments": ["armor","pike","sword","horse"],
        },
        "catapult": {
            "attack_range": 3,
            "move_range": 1,
            "attack_strength": 4,
            "cost": 100,
            "max_HP": 2,
            "viable_attachments": ["horse"],
        },
        "town_center": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "cost": 400,
            "buildable": true,
            "buildable_radius": 4,
        },
        "farm": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 2,
            "cost": 50,
            "buildable": true,
            "income": 5,
        },
        "barracks": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "buys_per_turn": 2,
            "cost": 100,
            "buildable": true,
            "can_make": ["soldier"],
        },
        "catapult_factory": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "buys_per_turn": 1,
            "cost": 100,
            "buildable": true,
            "can_make": ["catpult"],
        },
        "armory": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "buys_per_turn": 1,
            "cost": 300,
            "buildable": true,
            "can_make_equip": ["armor"],
        },
        "BA_shop": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "buys_per_turn": 1,
            "cost": 200,
            "buildable": true,
            "can_make_equip": ["bow_and_arrow"],
        },
        "sword_shop": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "buys_per_turn": 1,
            "cost": 100,
            "buildable": true,
            "can_make_equip": ["sword"],
        },
        "pike_shop": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "buys_per_turn": 1,
            "cost": 200,
            "buildable": true,
            "can_make_equip": ["pike"],
        },
        "stable": {
            "attack_range": 0,
            "move_range": 0,
            "max_HP": 4,
            "buys_per_turn": 1,
            "cost": 300,
            "buildable": true,
            "can_make_equip": ["horse"],
        },
    },
    "attachment_types": {
        "armor": {
            "cost": 30,
            "stat_alt": {
                "max_HP": 2,
            }
        },
        "bow_and_arrow": {
            "cost": 20,
            "stat_alt": {
                "attack_range": 2,
            }
        },
        "sword": {
            "cost": 10,
            "stat_alt": {
                "attack_strength": 1,
            }
        },
        "pike": {
            "cost": 30,
            "stat_alt": {
                "attack_range": 1,
                "attack_strength": 1,
            }
        },
        "horse": {
            "cost": 30,
            "stat_alt": {
                "move_range": 2,
            }
        }
    }
}
var icons = {
    "background_icon": "Background.png",
    "unit_icons": {
        "soldier": "Soldier.png",
        "catapult": "Catapult.png",
        "farm": "farm.png",
        "barracks": "barracks.png",
        "armory": "armory.png",
        "BA_shop": "bow-arrow-shop.png",
        "sword_shop": "sword-shop.png",
        "pike_shop": "pike-shop.png",
        "stable": "stable.png",
        "town_center": "stable.png",
    },
    "attach_icons": {
        "armor": "armor.png",
        "bow_and_arrow": "bow-arrow.png",
        "sword": "sword.png",
        "pike": "pike.png",
        "horse": "horse.png",
    }
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
function get_cost(stats,unit){
    var basecost = calc_stat(stats,unit,"cost")
    var attach_cost = 0;
    unit.attachments.forEach(function(attachname){
        var attachcost = stats.attachment_types[attachname].cost
        attach_cost += attachcost
    })
    return basecost+attach_cost
}
function get_player_cost(stats,map,player){
    var player_cost = 0;
    map.forEach(function(row){
        row.forEach(function(cell){
            if(cell.player === player){
                player_cost += get_cost(stats,cell)
            }
        })
    })
    return player_cost
}
module.exports = {
    default_stats: default_stats,
    calc_stat: calc_stat,
    icons: icons,
    get_player_cost: get_player_cost,
}
