#pragma once
#include "unit.h"
#include "game.hpp"

int get_player_assets(const Game & game,Player player);
int get_current_income(const Game & game,Player player);
inline bool is_player(const MapItem & item,Player player){
    return item.category == Category::UNIT &&
            item.unit.player == player;
}

using MoveAccum = std::vector<DecompMove>;
bool validate(const char *& errmsg,const Game & game,const GameMove & move, Player player);
bool is_valid(const Game & game,const GameMove & move, Player player);
void decomp_gamemove(MoveAccum & accum, const Game & game, const GameMove & instr);
void exec_gamemove(Game & game, const GameMove & instr);
void consume_decomped(Game & game,const DecompMove & move);
constexpr int NUM_HEURISTICS = 4;
using Heuristics = std::array<int,NUM_HEURISTICS>;
Heuristics get_heuristcs(const Game & game,Player player);
