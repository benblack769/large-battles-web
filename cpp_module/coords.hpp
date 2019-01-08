#pragma once
#include "array_view.hpp"

struct Coord{
    int x;
    int y;
    Coord operator + (Coord o){
        return Coord{x+o.x,y+o.y};
    }
};
template<class iter_fn>
void iter_around(Coord cen,int radius,iter_fn iter){
    for(int y = cen.y-radius; y <= cen.y+radius; y++){
        for(int x = cen.x-radius; x <= cen.x+radius; x++){
            iter(Coord{x,y});
        }
    }
}
struct GameSize{
    int x=35;
    int y=35;
    Coord idx_to_coord(int idx){
        return Coord{idx/this->x,idx%this->x};
    }
    int coord_to_idx(Coord c){
        return c.y*this->x + c.x;
    }
} game_size;
