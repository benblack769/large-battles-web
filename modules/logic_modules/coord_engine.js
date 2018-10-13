function make_coord(x,y){
    return {
        x: x,
        y: y
    }
}
function distance(c1,c2){
    return Math.max(Math.abs(c1.x-c2.x),
                    Math.abs(c1.y-c2.y))
}
function randint(maxint){
    return Math.floor(Math.random() * maxint);
}
function random_coord(){
    return make_coord(randint(x_size),randint(y_size))
}
function min_distance(point, point_list){
    var dist_list = point_list.map(p2=>distance(point,p2))
    return Math.min(...dist_list)
}
function dist_border(point){
    return Math.min(
        point.x,
        point.y,
        x_size - point.x - 1,
        y_size - point.y - 1,
    )
}
