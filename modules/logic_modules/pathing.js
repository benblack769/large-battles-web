/*var PF = require('pathfinding');

function map_to_taken(map){
    return map.map((row)=>row.map(cell=> (cell.category !== "empty")))
}
function at(map, coord){
    return map[coord.y][coord.x]
}
function set(map, coord, arg){
    map[coord.y][coord.x] = arg
}
function is_possible_move(map,start,target,range){
    var taken_matrix = map_to_taken(map)

    //Pathing API requires both start and target to be walkable
    set(taken_matrix,start,false)
    set(taken_matrix,target,false)

    var grid = new PF.Grid(taken_matrix);
    var finder = new PF.BestFirstFinder();

    var path = finder.findPath(start.x,start.y,target.x,target.y,grid)
    console.log(path)
    return path.length <= range+1
}*/
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
function is_possible_move(map,start,target,range){
    var taken = get_possible_set(map,start,range,[target])
    var htarget = JSON.stringify(target)
    return taken.has(htarget)
}
module.exports = {
    get_possible_moves: get_possible_moves,
    //get_possible_set: get_possible_set,
    is_possible_move: is_possible_move,
}
