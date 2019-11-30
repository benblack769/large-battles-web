#pragma once
#include "helpers/two_d_array.h"
#include "unit.h"
#include "stats.hpp"
#include "gamemove.hpp"
#include <array>

using Map = DArray2d<Unit>;
struct PlayerInfo{
    int money;
};
constexpr int NUM_PLAYERS = 2;
using PlayersOrder = std::array<PlayerInfo,NUM_PLAYERS>;
struct PlayersData{
    PlayersOrder order;
    Player active_player;
    const PlayerInfo & get(Player p)const{
        return order[static_cast<int>(p)];
    }
};
struct Game{
    Map map;
    PlayersData players;
    AllStats stats;
};
bool validate(std::string & errmsg,const Game & game,const GameMove & move);
void make_move(Game & game,const GameMove & move);
