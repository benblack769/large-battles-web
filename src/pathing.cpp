#include "pathing.hpp"
#include <array>
#include "game.hpp"
#include "two_d_array.h"

const std::array<Point,8> coords_around = {
    Point{1,1},
    Point{1,-1},
    Point{-1,1},
    Point{-1,-1},
    Point{1,0},
    Point{-1,0},
    Point{0,1},
    Point{0,-1}
};

template<class Ty>
class OffsetArray2d{
    Point offset;
    DArray2d<Ty> data;
public:
    OffsetArray2d(Point in_offset, Point size):
        offset(in_offset),
        data(size){}
    Ty & operator [](Point p){
        return data[p-offset];
    }
};
bool is_possible_move(const Map & map,Point start,Point end,int range){
    if(distance(start,end) > range){
        return false;
    }
    std::vector<Point> cur_list;
    std::vector<Point> next_list;
    OffsetArray2d<char> visited(start-to_square(range),to_square(range*2+1+1));
    cur_list.push_back(start);
    for(int r = 0; r < range && cur_list.size(); r++){
        for(Point curp : cur_list){
            if(!visited[curp]){
                visited[curp] = true;
                for(Point off : coords_around){
                    Point nextp = curp + off;
                    if(nextp == end){
                        return true;
                    }
                    if(map.in_bounds(nextp)){
                        next_list.push_back(nextp);
                    }
                }
            }
        }
        cur_list.swap(next_list);
        next_list.resize(0);
    }
    return false;
}
bool is_possible_attack(const Map & map,Point start,Point target, int range){
    if(start.x == target.x){
        int x = start.x;
        int min_y = std::min(start.y,target.y);
        int max_y = std::max(start.y,target.y);
        if(max_y - min_y > range){
            return false;
        }
        for(int y = min_y+1; y <= max_y-1; y++){
            if(map[Point{x,y}].category != Category::EMPTY){
                return false;
            }
        }
        return true;
    }
    else if(start.y == target.y){
        int y = start.y;
        int min_x = std::min(start.x,target.x);
        int max_x = std::max(start.x,target.x);
        if(max_x - min_x > range){
            return false;
        }
        for(int x = min_x+1; x <= max_x-1; x++){
            if(map[Point{x,y}].category != Category::EMPTY){
                return false;
            }
        }
        return true;
    }
    else{
        return false;
    }
}
