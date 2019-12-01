#pragma once
#include "helpers/two_d_array.h"
#include "unit.h"
#include "stats.hpp"
#include "gamemove.hpp"
#include "decomposed_move.hpp"
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
    PlayerInfo & get(Player p){
        return order[static_cast<int>(p)];
    }
};
struct Game{
    Map map;
    PlayersData players;
    AllStats stats;
};
