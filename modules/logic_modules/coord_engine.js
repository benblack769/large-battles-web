class CMath {
    constructor(x_size,y_size){
        this.x_size = x_size
        this.y_size = y_size
    }
    make_coord(x,y){
        return {
            x: x,
            y: y
        }
    }
    distance(c1,c2){
        return Math.max(Math.abs(c1.x-c2.x),
                        Math.abs(c1.y-c2.y))
    }
    randint(maxint){
        return Math.floor(Math.random() * maxint);
    }
    random_coord(){
        return make_coord(randint(x_size),randint(y_size))
    }
    min_distance(point, point_list){
        var dist_list = point_list.map(function(p2){return  distance(point,p2)})
        return Math.min.apply(null,dist_list)
    }
    dist_border(point){
        return Math.min(
            point.x,
            point.y,
            x_size - point.x - 1,
            y_size - point.y - 1
        )
    }
    set_size(xsize,ysize){
        x_size = xsize;
        y_size = ysize;
    }
}
module.exports = {
    CMath: CMath,
}
