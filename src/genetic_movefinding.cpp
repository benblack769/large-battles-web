#include "movefinding.hpp"
#include "game_utils.hpp"
#include <random>
#include <iostream>
#include <cassert>
std::random_device true_rand;
using randgen = std::default_random_engine;
using MoveMap = DArray2d<GameMove>;
int rand_int(randgen & gen, int maxsize){
    std::uniform_int_distribution<int> distribution(0,maxsize-1);
    return distribution(gen);
}
template<class VecTy>
auto rand_choice(randgen & gen, VecTy & vec){
    return vec[rand_int(gen,vec.size())];
}
Point rand_point(randgen & gen,Point maxsize){
    return Point{rand_int(gen,maxsize.x),rand_int(gen,maxsize.y)};
}
template<typename listty>
void shuffle(randgen & gen,listty & movelist){
    std::uniform_int_distribution<int> distribution(0,movelist.size()-1);
    for(auto & move : movelist){
        std::swap(move,movelist[distribution(gen)]);
    }
}
void elim_random(randgen & gen,MoveList & movelist){
    std::uniform_int_distribution<int> distribution(0,movelist.size()-1);
    movelist.erase(movelist.begin()+distribution(gen));
}
int sample_dim(randgen & gen,int cen, int range,int max){
    int upper = std::min(cen + range+1,max);
    int lower = std::max(cen - range,0);
    int sample = rand_int(gen,upper-lower)+lower;
    return sample;
}
Point sample_coord(randgen & gen,const Map & map,Point cen,int range){
    return Point{
        sample_dim(gen,cen.x,range,map.width),
        sample_dim(gen,cen.y,range,map.height)
    };
}
template<class EnumTy, EnumTy max_val>
EnumTy sample_enum(randgen & gen){
    int max_types = static_cast<int>(max_val);
    EnumTy sampled_type = static_cast<EnumTy>(rand_int(gen,max_types));
    return sampled_type;
}
#define sample_movetype sample_enum<MoveType,MoveType::MAX_MOVE_TYPES>
#define sample_unittype  sample_enum<UnitType,UnitType::UNIT_TYPES_MAX>
#define sample_attachtype  sample_enum<AttachType,AttachType::ATTACH_TYPES_MAX>

JoinedInfo sample_type(randgen & gen,const Game & game,Point coord,MoveType type){
    Unit unit = game.map.at(coord);
    assert(unit.category == Category::UNIT);
    UnitStat stats = game.stats.total_stats(unit);
    int BUY_RANGE = 1;
    switch(type){
    case MoveType::MOVE:
        return JoinedInfo{.move=MoveInfo{
                    .start_coord=coord,
                    .end_coord=sample_coord(gen,game.map,coord,stats.move_range)
        }};
    case MoveType::ATTACK: return JoinedInfo{.attack=AttackInfo{
                    .source_coord=coord,
                    .target_coord=sample_coord(gen,game.map,coord,stats.attack_range)
        }};
    case MoveType::BUILD: return JoinedInfo{.build=BuildInfo{
                   .coord=coord,
                  .building_type=sample_unittype(gen)
        }};
    case MoveType::BUY_UNIT: return JoinedInfo{.buy_unit=BuyUnitInfo{
                    .placement_coord=sample_coord(gen,game.map,coord,BUY_RANGE),
                    .building_coord=coord,
                    .buy_type=sample_unittype(gen)
        }};
    case MoveType::BUY_ATTACHMENT: return JoinedInfo{.buy_attach=BuyAttachInfo{
                    .equip_coord=sample_coord(gen,game.map,coord,BUY_RANGE),
                    .building_coord=coord,
                    .equip_type=sample_attachtype(gen)
        }};
    default: assert(false && "bad move type passed to sample_move");
        return JoinedInfo{};
    }
}
GameMove sample_legal_moves(randgen & gen,const Game & game,Point coord){
    const int TYPE_CHANCES = 3;
    const int CHANCES_PER_TYPE = 5;
    for(int type_choices = 0; type_choices < TYPE_CHANCES; type_choices++){
        MoveType samp_type;
        do{
            samp_type = sample_movetype(gen);
        }while(samp_type == MoveType::GAME_STARTED ||
               samp_type == MoveType::END_TURN );
        for(int i = 0; i < CHANCES_PER_TYPE; i++){
            GameMove move{
                .move=samp_type,
                .info=sample_type(gen,game,coord,samp_type)
            };
            if(is_valid(game,move,game.players.active_player)){
                return move;
            }
        }
    }
    return GameMove{.move=MoveType::NULL_MOVE,.info=JoinedInfo{}};
}
std::vector<Point> unit_points(const Game & game,Player player){
    std::vector<Point> res;
    for(Point p : point_range(game.map.shape())){
        if(game.map[p].category == Category::UNIT &&
                game.map[p].player == player){
            res.push_back(p);
        }
    }
    return res;
}
MoveList random_moves(randgen & gen,const Game & game){
    std::vector<Point> move_points = unit_points(game,game.players.active_player);
    shuffle(gen,move_points);
    Game temp_game = game;
    MoveList moves;
    for(Point movep : move_points){
        GameMove sample_move = sample_legal_moves(gen,temp_game,movep);
        if(sample_move.move != MoveType::NULL_MOVE){
            moves.push_back(sample_move);
            exec_gamemove(temp_game,sample_move);
        }
    }
    return moves;
}
MoveList random_moves(const Game & game){
    randgen generator(true_rand());
    return random_moves(generator,game);
}
bool is_valid(const Game & old_game,const MoveList & moves){
    Game game = old_game;
    for(GameMove move : moves){
        if(is_valid(game,move,game.players.active_player)){
            exec_gamemove(game,move);
        }
        else{
            return false;
        }
    }
    return true;
}
Game continuation(const Game & old_game,const MoveList & moves){
    Game game = old_game;
    for(GameMove move : moves){
        assert(is_valid(game,move,game.players.active_player));
        exec_gamemove(game,move);
    }
    return game;
}
MoveList mutate(randgen & gen,const MoveList & moves,const Game & game){
    //tries to mutate a few times before giving up
    for(int mut = 0; mut < 10; mut++){
        MoveList res = moves;
        int mutate_type = rand_int(gen,3);
        if(mutate_type == 0){
            //random order swaps
            int swap_count = rand_int(gen,10);
            for(int i = 0; i < swap_count; i++){
                std::swap(res[rand_int(gen,res.size())],res[rand_int(gen,res.size())]);
            }
        }
        else if(mutate_type == 1){
            //random addition (being careful about trying your best to add a ledgal move)
            Game cur_game = continuation(game,res);
            auto possible_points = unit_points(cur_game,cur_game.players.active_player);
            Point add_point = rand_choice(gen,possible_points);
            GameMove move_to_add = sample_legal_moves(gen,cur_game,add_point);
            if(move_to_add.move != MoveType::NULL_MOVE){
                res.push_back(move_to_add);
            }
        }
        else if (mutate_type == 2){
            //random removal
            int rand_idx = rand_int(gen,res.size());
            res.erase(res.begin()+rand_idx);
        }
        if(is_valid(game,res)){
            return res;
        }
    }
    return moves;
}
Point move_point(GameMove move){
    switch(move.move){
    case MoveType::ATTACK: return move.info.attack.source_coord;
    case MoveType::MOVE: return move.info.move.start_coord;
    case MoveType::BUILD: return move.info.build.coord;
    case MoveType::BUY_UNIT: return move.info.buy_unit.building_coord;
    case MoveType::BUY_ATTACHMENT: return move.info.buy_attach.building_coord;
    default: assert("bad movetype"); return Point{};
    }
}
using MoveMap = DArray2d<GameMove>;
MoveMap to_movemap(Point gamesize,const MoveList & moves){
    MoveMap move_map(gamesize);
    move_map.fill(GameMove{.move=MoveType::NULL_MOVE,.info=JoinedInfo{}});
    for(GameMove move : moves){
        move_map.at(move_point(move)) = move;
    }
    return move_map;
}
Point crossover_shape(randgen & gen,Point gamesize){
    int size_type = rand_int(gen,3);
    int max_size = size_type == 0 ? 3 : size_type == 1 ? 7 : 15;
    assert(max_size < gamesize.x && max_size < gamesize.y);
    return rand_point(gen,Point{max_size,max_size});
}
MoveList crossover(randgen & gen,const Game & game,const MoveList & moves1,const MoveList & moves2){
    Point gamesize = game.map.shape();
    MoveMap map1 = to_movemap(gamesize,moves1);
    MoveMap map2 = to_movemap(gamesize,moves2);

    Point cross_size = crossover_shape(gen,gamesize);
    Point cross_pos = rand_point(gen,gamesize-cross_size);

    for(Point cp : point_range(cross_pos,cross_pos+cross_size)){
        map1[cp] = map2[cp];
    }
    return map1;
}
