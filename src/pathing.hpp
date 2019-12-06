#pragma once
#include "point.hpp"
#include "game.hpp"

inline int distance(Point c1, Point c2){
    return std::max(abs(c1.x-c2.x),abs(c1.y-c2.y));
}

bool is_possible_attack(const Map & map,Point start,Point end, int range);
bool is_possible_move(const Map & map,Point start,Point end,int range);
