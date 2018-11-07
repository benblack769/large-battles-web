function make_coord(x,y){
    return {
        x: x,
        y: y
    }
}
function randint(maxint){
    return Math.floor(Math.random() * maxint);
}
class CMath {
    constructor(x_size,y_size){
        this.x_size = x_size
        this.y_size = y_size
    }
    distance(c1,c2){
        return Math.max(Math.abs(c1.x-c2.x),
                        Math.abs(c1.y-c2.y))
    }
    random_coord(){
        return make_coord(randint(this.x_size),randint(this.y_size))
    }
    min_distance(point, point_list){
        var dist_list = point_list.map((p2) => this.distance(point,p2))
        return Math.min.apply(null,dist_list)
    }
    dist_border(point){
        return Math.min(
            point.x,
            point.y,
            this.x_size - point.x - 1,
            this.y_size - point.y - 1
        )
    }
}
module.exports = {
    CMath: CMath,
    make_coord: make_coord,
}
