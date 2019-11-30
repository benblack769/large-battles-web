#include "pathing.hpp"
#include <array>
#include <unordered_set>
#include "game.hpp"

const std::array<Point,8> coords_around = {
    Point(1,1),
    Point(1,-1),
    Point(-1,1),
    Point(-1,-1),
    Point(1,0),
    Point(-1,0),
    Point(0,1),
    Point(0,-1)
};

bool is_possible_move(const Map & map,Point start,Point end,int range){
    std::vector<Point> cur_list;
    std::vector<Point> next_list;
    std::unordered_set<Point> visited;
    cur_list.push_back(start);
    for(int r = 0; r < range && cur_list.size(); r++){
        for(Point curp : cur_list){
            if(!visited.count(curp)){
                visited.insert(curp);
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
    if(start.X == target.X){
        int x = start.X;
        int min_y = std::min(start.Y,target.Y);
        int max_y = std::max(start.Y,target.Y);
        if(max_y - min_y > range){
            return false;
        }
        for(int y = min_y+1; y <= max_y-1; y++){
            if(map.at(Point(x,y)).category != Category::EMPTY){
                return false;
            }
        }
        return true;
    }
    else if(start.Y == target.Y){
        int y = start.Y;
        int min_x = std::min(start.X,target.X);
        int max_x = std::max(start.X,target.X);
        if(max_x - min_x > range){
            return false;
        }
        for(int x = min_x+1; x <= max_x-1; x++){
            if(map.at(Point(x,y)).category != Category::EMPTY){
                return false;
            }
        }
        return true;
    }
    else{
        return false;
    }
}
