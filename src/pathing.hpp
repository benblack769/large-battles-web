#pragma once
#include "point.hpp"
#include "game.hpp"

inline int distance(Point c1, Point c2){
    return std::max(abs(c1.X-c2.X),abs(c1.Y-c2.Y));
}

bool is_possible_attack(const Map & map,Point start,Point end, int range);
bool is_possible_move(const Map & map,Point start,Point end,int range);
