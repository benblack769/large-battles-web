#include "movefinding.hpp"
#include "game_utils.hpp"
#include <random>
std::random_device true_rand;
using randgen = std::default_random_engine;
using MoveMap = DArray2d<GameMove>;
int rand_int(randgen & gen, int maxsize){
    std::uniform_int_distribution<int> distribution(0,maxsize);
    return distribution(gen);
}
void shuffle(randgen & gen,MoveList & movelist){
    std::uniform_int_distribution<int> distribution(0,movelist.size()-1);
    for(GameMove & move : movelist){
        std::swap(move,movelist[distribution(gen)]);
    }
}
void elim_random(randgen & gen,MoveList & movelist){
    std::uniform_int_distribution<int> distribution(0,movelist.size()-1);
    movelist.erase(movelist.begin()+distribution(gen));
}
Point sample_coord(randgen & gen,const Map & map,Point cen,int range){
    int upperx = std::min(range+cen.x+1,map.height);
    int uppery = std::min(range+cen.y+1,map.width);
    int lowerx = std::max(range-cen.x,0);
    int lowery = std::max(range-cen.y,0);
    int samplex = rand_int(gen,upperx-lowerx)+lowerx;
    int sampley = rand_int(gen,uppery-lowery)+lowery;
    return Point{samplex,sampley};
}
std::vector<Point> unit_points(const Game & game,Player player){
    std::vector<Point> res;
    for(Point p : point_range(game.map.shape())){
        if(game.map[p].player == player){
            res.push_back(p);
        }
    }
    return res;
}
MoveType sample_type(randgen & gen){
    int max_types = static_cast<int>(MoveType::MAX_MOVE_TYPES);
    MoveType sampled_type = static_cast<MoveType>(rand_int(gen,max_types));
    return sampled_type;
}
GameMove sample_move(randgen & gen,const Game & game,Player player,Point coord){
    switch(sample_type(gen)){
        case MoveType::ATTACK:
    }
}
GameMove sample_legal_moves(randgen & gen,const Game & game,Player player,Point coord){
    GameMove res;
    do{
        res = sample_move(gen,game,player,coord);
    }while(is_valid(game,res,player));
    return res;
}
MoveList random_moves(const Game & game,Player player){

}
MoveList find_moves(const Game & game,Player player){
    randgen generator(true_rand());

}
