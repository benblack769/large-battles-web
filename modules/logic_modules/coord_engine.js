var x_size = null;
var y_size = null;

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
    var dist_list = point_list.map(function(p2){return  distance(point,p2)})
    return Math.min.apply(null,dist_list)
}
function dist_border(point){
    return Math.min(
        point.x,
        point.y,
        x_size - point.x - 1,
        y_size - point.y - 1
    )
}
function set_size(xsize,ysize){
    x_size = xsize;
    y_size = ysize;
}
module.exports = {
    set_size: set_size,
    dist_border: dist_border,
    min_distance: min_distance,
    random_coord: random_coord,
    distance: distance,
    min_distance: min_distance,
    make_coord: make_coord,
}
