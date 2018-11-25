function coords_around(c){
    var x = c.x
    var y = c.y
    return [
        {
            x: x+1,
            y: y+1,
        },
        {
            x: x,
            y: y+1,
        },
        {
            x: x-1,
            y: y+1,
        },
        {
            x: x+1,
            y: y,
        },
        {
            x: x-1,
            y: y,
        },
        {
            x: x+1,
            y: y-1,
        },
        {
            x: x,
            y: y-1,
        },
        {
            x: x-1,
            y: y-1,
        },
    ]
}
function get_path(parents,target){
    var cur_coord = target
    var path = [target]
    while(parents.get(cur_coord)){
        path.push(parents.get(cur_coord))
        cur_coord = parents.get(cur_coord)
    }
    path.reverse()
    return path.map(JSON.parse)
}
function get_shortest_path(map,start,target){
    //move_tos are an array of coords which you can move to even if they are blocked on the map
    var hashable = JSON.stringify
    var parents = new Map()
    var htarget = hashable(target)
    parents.set(hashable(start),null)
    var cur_list = [start]
    var next_list = []
    while(cur_list.length){
        for(var i = 0; i < cur_list.length; i++){
            var next_coords = coords_around(cur_list[i])
            for(var j = 0; j < next_coords.length; j++){
                var nc = next_coords[j]
                var hnc = hashable(nc)
                if(!parents.has(hnc)){
                    if(map[nc.y] && map[nc.y][nc.x] && map[nc.y][nc.x].category === "empty"){
                        next_list.push(nc)
                        parents.set(hnc,hashable(cur_list[i]))
                        if(hnc === htarget){
                            return get_path(parents,htarget)
                        }
                    }
                }
            }
        }
        cur_list = next_list
        next_list = []
    }
    return null
}
function get_possible_set(map,start,range,move_tos){
    //move_tos are an array of coords which you can move to even if they are blocked on the map
    var hashable = JSON.stringify
    var move_tos_set = move_tos === undefined ? new Set() : new Set(move_tos.map(hashable))
    var taken_coords = new Set()
    taken_coords.add(hashable(start))
    var cur_list = [start]
    var next_list = []
    for(var turns = 0; turns < range; turns++){
        for(var i = 0; i < cur_list.length; i++){
            var next_coords = coords_around(cur_list[i])
            for(var j = 0; j < next_coords.length; j++){
                var nc = next_coords[j]
                var hnc = hashable(nc)
                if(!taken_coords.has(hnc)){
                    if(map[nc.y] && map[nc.y][nc.x] && map[nc.y][nc.x].category === "empty"){
                        next_list.push(nc)
                        taken_coords.add(hnc)
                    }
                    else if(move_tos_set.has(hnc)){
                        taken_coords.add(hnc)
                    }
                }
            }
        }
        cur_list = next_list
        next_list = []
    }
    taken_coords.delete(hashable(start))
    return taken_coords
}
function get_possible_moves(map,start,range,move_tos){
    var taken = get_possible_set(map,start,range,move_tos)
    return Array.from(taken).map((hc)=>JSON.parse(hc))
}
function distance(c1,c2){
    return Math.max(Math.abs(c1.x-c2.x),
                    Math.abs(c1.y-c2.y))
}
function is_possible_move_false_positives(start,target,range){
    return distance(start,target) <= range
}
function is_possible_move(map,start,target,range){
    if (!is_possible_move_false_positives(start,target,range)){
        return false
    }
    var taken = get_possible_set(map,start,range,[target])
    var htarget = JSON.stringify(target)
    return taken.has(htarget)
}
function is_possible_attack(map, start, target, range){
    if(start.x - target.x === 0){
        var x = start.x
        var min_y = Math.min(start.y,target.y)
        var max_y = Math.max(start.y,target.y)
        if(max_y - min_y > range){
            return false
        }
        for(var y = min_y+1; y <= max_y-1; y++){
            if(map[y][x].category !== "empty"){
                return false
            }
        }
        return true
    }
    else if(start.y - target.y === 0){
        var y = start.y
        var min_x = Math.min(start.x,target.x)
        var max_x = Math.max(start.x,target.x)
        if(max_x - min_x > range){
            return false
        }
        for(var x = min_x+1; x <= max_x-1; x++){
            if(map[y][x].category !== "empty"){
                return false
            }
        }
        return true
    }
    else{
        return false
    }
}
module.exports = {
    get_possible_moves: get_possible_moves,
    //get_possible_set: get_possible_set,
    is_possible_move: is_possible_move,
    get_shortest_path: get_shortest_path,
    is_possible_attack: is_possible_attack,
}
