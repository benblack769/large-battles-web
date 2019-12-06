#include "game.hpp"
#include <iostream>
#include "game_utils.hpp"


int main(){
    GameMove move;
    DecompMove dmove;
    DArray2d<int> ints(5,10);
    ints.at(Point{4,9});
    for(Point p : point_range(Point{1,2},Point{3,4})){
        std::cout << p << "\n";
    }

    std::cout << sizeof(move) << "\n";
    std::cout << sizeof(dmove) << "\n";
}
